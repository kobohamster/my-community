import { useEffect, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PostListPage from './pages/PostListPage'
import PostWritePage from './pages/PostWritePage'
import PostDetailPage from './pages/PostDetailPage'

const GUEST_DURATION_MS = 3 * 60 * 1000 // 3분

const ProtectedRoute = ({ children, session, profile, isGuest }) => {
  if (!session && !isGuest) return <Navigate to="/login" replace />
  if (session && !profile) return null
  return children
}

const App = () => {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [guestSecondsLeft, setGuestSecondsLeft] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      return
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [session])

  // 게스트 타이머
  useEffect(() => {
    if (!isGuest) return
    setGuestSecondsLeft(GUEST_DURATION_MS / 1000)
    const interval = setInterval(() => {
      setGuestSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setIsGuest(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isGuest])

  const handleGuestAccess = useCallback(() => {
    setIsGuest(true)
  }, [])

  if (session === undefined) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onGuestAccess={handleGuestAccess} />
            )
          }
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute session={session} profile={profile} isGuest={isGuest}>
              <PostListPage
                session={session}
                profile={profile}
                isGuest={isGuest}
                guestSecondsLeft={guestSecondsLeft}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/write"
          element={
            isGuest ? (
              <Navigate to="/" replace />
            ) : (
              <ProtectedRoute session={session} profile={profile} isGuest={false}>
                <PostWritePage session={session} profile={profile} />
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedRoute session={session} profile={profile} isGuest={isGuest}>
              <PostDetailPage session={session} profile={profile} isGuest={isGuest} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
