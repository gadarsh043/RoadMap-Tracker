import { auth } from './firebase'

function getWorkerBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_VOICE_API_URL
  if (!apiUrl) {
    throw new Error('VITE_VOICE_API_URL is not configured')
  }
  return apiUrl.replace(/\/$/, '')
}

export async function createUserAccount(email: string, password: string) {
  const user = auth.currentUser
  if (!user) {
    throw new Error('Must be signed in')
  }

  const idToken = await user.getIdToken()
  const res = await fetch(`${getWorkerBaseUrl()}/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error ?? 'Failed to create user')
  }

  return res.json() as Promise<{ uid: string; email: string }>
}
