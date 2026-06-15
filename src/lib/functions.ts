import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'
import type { VoiceIdeaResult } from '../types/roadmap'

export async function processVoiceIdea(audioBase64: string, mimeType: string): Promise<VoiceIdeaResult> {
  const fn = httpsCallable<{ audioBase64: string; mimeType: string }, VoiceIdeaResult>(
    functions,
    'processVoiceIdea',
  )
  const result = await fn({ audioBase64, mimeType })
  return result.data
}

export async function createUserAccount(email: string, password: string) {
  const fn = httpsCallable<{ email: string; password: string }, { uid: string; email: string }>(
    functions,
    'createUser',
  )
  const result = await fn({ email, password })
  return result.data
}
