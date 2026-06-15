export interface Env {
  GROQ_API_KEY: string
  FIREBASE_API_KEY: string
  ALLOWED_ORIGINS: string
}

interface VoiceIdeaResult {
  title: string
  description: string
  emoji: string
  transcript: string
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
  },
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
