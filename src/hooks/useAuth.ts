import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { UserProfile } from '../types/roadmap'

export interface AuthUser {
  uid: string
  email: string
  isAdmin: boolean
  profile: UserProfile | null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }

      const authUser = await buildAuthUser(firebaseUser)
      setUser(authUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { user, loading, isLoggedIn: !!user, isAdmin: !!user?.isAdmin }
}

async function buildAuthUser(firebaseUser: User): Promise<AuthUser> {
  const tokenResult = await firebaseUser.getIdTokenResult()
  const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
  const profile = profileSnap.exists() ? (profileSnap.data() as UserProfile) : null

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    isAdmin: tokenResult.claims.admin === true || profile?.role === 'admin',
    profile,
  }
}

export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function logout() {
  await signOut(auth)
}
