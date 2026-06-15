import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { onCall, HttpsError, onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import Groq from 'groq-sdk'

initializeApp()

const groqApiKey = defineSecret('GROQ_API_KEY')
const ADMIN_EMAIL = 'g.adarsh043@gmail.com'

interface VoiceIdeaResult {
  title: string
  description: string
  emoji: string
  transcript: string
}

export const processVoiceIdea = onCall(
  { secrets: [groqApiKey], cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.')
    }

    const { audioBase64, mimeType } = request.data as {
      audioBase64?: string
      mimeType?: string
    }

    if (!audioBase64 || !mimeType) {
      throw new HttpsError('invalid-argument', 'audioBase64 and mimeType are required.')
    }

    const groq = new Groq({ apiKey: groqApiKey.value() })
    const audioBuffer = Buffer.from(audioBase64, 'base64')
    const ext = mimeType.includes('webm') ? 'webm' : 'mp4'
    const tmpPath = path.join(os.tmpdir(), `voice-${Date.now()}.${ext}`)

    let transcript = ''
    try {
      fs.writeFileSync(tmpPath, audioBuffer)
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(tmpPath),
        model: 'whisper-large-v3',
        response_format: 'text',
      })
      transcript = typeof transcription === 'string' ? transcription : String(transcription)
    } catch (err) {
      console.error('Whisper error:', err)
      throw new HttpsError('internal', 'Failed to transcribe audio.')
    } finally {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
    }

    if (!transcript.trim()) {
      throw new HttpsError('invalid-argument', 'Could not understand audio.')
    }

    try {
      const completion = await groq.chat.completions.create({
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
      })

      const content = completion.choices[0]?.message?.content ?? '{}'
      const parsed = JSON.parse(content) as Partial<VoiceIdeaResult>

      return {
        title: parsed.title?.slice(0, 120) || 'New idea',
        description: parsed.description || transcript,
        emoji: parsed.emoji || '💡',
        transcript,
      } satisfies VoiceIdeaResult
    } catch (err) {
      console.error('LLM error:', err)
      return {
        title: transcript.slice(0, 80),
        description: transcript,
        emoji: '💡',
        transcript,
      }
    }
  },
)

export const createUser = onCall({ cors: true }, async (request) => {
  if (!request.auth?.token.admin) {
    throw new HttpsError('permission-denied', 'Admin access required.')
  }

  const { email, password } = request.data as { email?: string; password?: string }

  if (!email || !password || password.length < 6) {
    throw new HttpsError('invalid-argument', 'Valid email and password (6+ chars) required.')
  }

  try {
    const userRecord = await getAuth().createUser({ email, password })
    await getFirestore().doc(`users/${userRecord.uid}`).set({
      email,
      role: 'user',
      createdAt: FieldValue.serverTimestamp(),
      createdBy: request.auth.uid,
    })

    return { uid: userRecord.uid, email }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create user'
    throw new HttpsError('internal', message)
  }
})

export const seedAdmin = onRequest({ cors: true }, async (_req, res) => {
  try {
    const auth = getAuth()
    const db = getFirestore()

    let user
    try {
      user = await auth.getUserByEmail(ADMIN_EMAIL)
    } catch {
      res.status(404).json({
        error: `No Firebase Auth user found for ${ADMIN_EMAIL}. Create the account first, then run seedAdmin.`,
      })
      return
    }

    await auth.setCustomUserClaims(user.uid, { admin: true })
    await db.doc(`users/${user.uid}`).set(
      {
        email: ADMIN_EMAIL,
        role: 'admin',
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    res.json({ success: true, uid: user.uid, email: ADMIN_EMAIL })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
})
