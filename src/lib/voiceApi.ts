import { auth } from './firebase'
import type { VoiceIdeaResult } from '../types/roadmap'

export async function processVoiceIdea(
  audioBase64: string,
  mimeType: string,
): Promise<VoiceIdeaResult> {
  const apiUrl = import.meta.env.VITE_VOICE_API_URL
  if (!apiUrl) {
    throw new Error('VITE_VOICE_API_URL is not configured')
  }

  const user = auth.currentUser
  if (!user) {
    throw new Error('Must be signed in')
  }

  const idToken = await user.getIdToken()
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ audioBase64, mimeType }),
  })

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error ?? 'Voice processing failed')
  }

  return res.json() as Promise<VoiceIdeaResult>
}
