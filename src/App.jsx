import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PostListPage from './pages/PostListPage'
import PostWritePage from './pages/PostWritePage'
import PostDetailPage from './pages/PostDetailPage'
import AdminPage from './pages/AdminPage'
import PendingPage from './pages/PendingPage'

const ProtectedRoute = ({ children, session, profile, requireAdmin }) => {
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return null
  if (profile.status === 'pending') return <Navigate to="/pending" replace />
  if (profile.status === 'rejected') return <Navigate to="/login" replace />
  if (requireAdmin && !profile.is_admin) return <Navigate to="/" replace />
  return children
}

const App = () => {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)

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

  if (session === undefined) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/pending"
          element={
            session && profile?.status === 'pending'
              ? <PendingPage profile={profile} />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute session={session} profile={profile}>
              <PostListPage session={session} profile={profile} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/write"
          element={
            <ProtectedRoute session={session} profile={profile}>
              <PostWritePage session={session} profile={profile} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedRoute session={session} profile={profile}>
              <PostDetailPage session={session} profile={profile} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute session={session} profile={profile} requireAdmin>
              <AdminPage session={session} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
