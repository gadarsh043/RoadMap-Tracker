export interface Env {
  GROQ_API_KEY: string
  FIREBASE_API_KEY: string
  FIREBASE_SERVICE_ACCOUNT: string
  ALLOWED_ORIGINS: string
  ADMIN_EMAIL: string
}

interface VoiceIdeaResult {
  title: string
  description: string
  emoji: string
  transcript: string
}

interface ServiceAccount {
  project_id: string
  client_email: string
  private_key: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? ''
    const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    const corsOrigin = allowed.includes(origin) ? origin : allowed[0] ?? ''

    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders)
    }

    const authHeader = request.headers.get('Authorization') ?? ''
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!idToken) {
      return json({ error: 'Must be signed in' }, 401, corsHeaders)
    }

    const user = await verifyFirebaseToken(idToken, env.FIREBASE_API_KEY)
    if (!user) {
      return json({ error: 'Invalid auth token' }, 401, corsHeaders)
    }

    const path = new URL(request.url).pathname.replace(/\/$/, '') || '/'

    if (path === '/create-user') {
      return handleCreateUser(request, user, env, corsHeaders)
    }

    return handleVoice(request, env, corsHeaders)
  },
}

async function handleCreateUser(
  request: Request,
  user: { localId: string; email?: string },
  env: Env,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  if (user.email !== env.ADMIN_EMAIL) {
    return json({ error: 'Admin access required' }, 403, corsHeaders)
  }

  if (!env.FIREBASE_SERVICE_ACCOUNT) {
    return json({ error: 'User creation is not configured on the server' }, 503, corsHeaders)
  }

  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, corsHeaders)
  }

  const { email, password } = body
  if (!email || !password || password.length < 6) {
    return json({ error: 'Valid email and password (6+ chars) required' }, 400, corsHeaders)
  }

  try {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount
    const accessToken = await getGoogleAccessToken(serviceAccount)
    const uid = await createAuthUser(serviceAccount.project_id, accessToken, email, password)
    await createUserProfile(serviceAccount.project_id, accessToken, uid, email, user.localId)
    return json({ uid, email }, 200, corsHeaders)
  } catch (err) {
    console.error('Create user error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create user'
    return json({ error: message }, 500, corsHeaders)
  }
}

async function handleVoice(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  let body: { audioBase64?: string; mimeType?: string }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, corsHeaders)
  }

  const { audioBase64, mimeType } = body
  if (!audioBase64 || !mimeType) {
    return json({ error: 'audioBase64 and mimeType are required' }, 400, corsHeaders)
  }

  try {
    const result = await processVoice(audioBase64, mimeType, env.GROQ_API_KEY)
    return json(result, 200, corsHeaders)
  } catch (err) {
    console.error('Voice processing error:', err)
    const message = err instanceof Error ? err.message : 'Voice processing failed'
    return json({ error: message }, 500, corsHeaders)
  }
}

async function createAuthUser(
  projectId: string,
  accessToken: string,
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, emailVerified: false }),
    },
  )

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? 'Failed to create auth user')
  }

  const data = (await res.json()) as { localId?: string }
  if (!data.localId) {
    throw new Error('Auth user created but no UID returned')
  }
  return data.localId
}

async function createUserProfile(
  projectId: string,
  accessToken: string,
  uid: string,
  email: string,
  createdBy: string,
): Promise<void> {
  const now = new Date().toISOString()
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?documentId=${uid}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          email: { stringValue: email },
          role: { stringValue: 'user' },
          createdAt: { timestampValue: now },
          createdBy: { stringValue: createdBy },
        },
      }),
    },
  )

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? 'Failed to create user profile')
  }
}

async function getGoogleAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
    }),
  )

  const unsigned = `${header}.${payload}`
  const signature = await signJwt(unsigned, serviceAccount.private_key)
  const jwt = `${unsigned}.${signature}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    throw new Error('Failed to obtain Google access token')
  }

  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) {
    throw new Error('No access token in Google response')
  }
  return data.access_token
}

async function signJwt(data: string, pem: string): Promise<string> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(data),
  )

  return base64UrlEncodeBytes(new Uint8Array(signature))
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function verifyFirebaseToken(
  idToken: string,
  apiKey: string,
): Promise<{ localId: string; email?: string } | null> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  )

  if (!res.ok) return null
  const data = (await res.json()) as { users?: { localId: string; email?: string }[] }
  return data.users?.[0] ?? null
}

async function processVoice(
  audioBase64: string,
  mimeType: string,
  groqApiKey: string,
): Promise<VoiceIdeaResult> {
  const binary = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0))
  const ext = mimeType.includes('webm') ? 'webm' : 'mp4'
  const blob = new Blob([binary], { type: mimeType })

  const form = new FormData()
  form.append('file', blob, `voice.${ext}`)
  form.append('model', 'whisper-large-v3')
  form.append('response_format', 'text')

  const transcriptionRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${groqApiKey}` },
    body: form,
  })

  if (!transcriptionRes.ok) {
    const errText = await transcriptionRes.text()
    console.error('Groq transcription error:', errText)
    throw new Error('Failed to transcribe audio')
  }

  const transcript = (await transcriptionRes.text()).trim()
  if (!transcript) {
    throw new Error('Could not understand audio')
  }

  try {
    const completionRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You extract roadmap feature ideas from spoken transcripts.
Return ONLY valid JSON with keys: title (max 80 chars), description (1-3 sentences), emoji (single emoji).
Example: {"title":"Dark mode","description":"Add a dark theme toggle in settings.","emoji":"🌙"}`,
          },
          {
            role: 'user',
            content: `Transcript: "${transcript}"`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    })

    if (!completionRes.ok) {
      throw new Error('LLM request failed')
    }

    const completion = (await completionRes.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = completion.choices?.[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as Partial<VoiceIdeaResult>

    return {
      title: parsed.title?.slice(0, 120) || 'New idea',
      description: parsed.description || transcript,
      emoji: parsed.emoji || '💡',
      transcript,
    }
  } catch {
    return {
      title: transcript.slice(0, 80),
      description: transcript,
      emoji: '💡',
      transcript,
    }
  }
}

function json(data: unknown, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}
