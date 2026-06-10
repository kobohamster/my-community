import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  Box, Container, Typography, TextField, Button,
  Tab, Tabs, Alert, Divider, CircularProgress,
} from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { session, signIn, signUp, signInWithGoogle } = useAuth()
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ email: '', password: '', username: '' })

  if (session) return <Navigate to="/" replace />

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 0) {
        await signIn({ email: form.email, password: form.password })
        navigate('/')
      } else {
        if (!form.username.trim()) { setError('닉네임을 입력해주세요.'); return }
        await signUp({ email: form.email, password: form.password, username: form.username.trim() })
        setError('')
        setSuccess('가입 완료! 바로 로그인할 수 있습니다.')
        setForm({ email: form.email, password: form.password, username: '' })
        setTab(0)
      }
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Google 로그인 오류')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontSize: '2.5rem', mb: 0.5 }}>🍫</Typography>
          <Typography variant="h5" fontWeight={700} color="primary">chocorate</Typography>
          <Typography variant="body2" color="text.secondary">초콜릿 리뷰 SNS</Typography>
        </Box>

        <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 3, boxShadow: '0 2px 12px rgba(64,42,30,0.08)' }}>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); setSuccess('') }} centered sx={{ mb: 2 }}>
            <Tab label="로그인" />
            <Tab label="회원가입" />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, fontSize: '0.8rem' }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {tab === 1 && (
                <TextField
                  name="username"
                  label="닉네임"
                  value={form.username}
                  onChange={handleChange}
                  size="small"
                  required
                  fullWidth
                  inputProps={{ maxLength: 20 }}
                />
              )}
              <TextField
                name="email"
                label="이메일"
                type="email"
                value={form.email}
                onChange={handleChange}
                size="small"
                required
                fullWidth
              />
              <TextField
                name="password"
                label="비밀번호"
                type="password"
                value={form.password}
                onChange={handleChange}
                size="small"
                required
                fullWidth
                inputProps={{ minLength: 6 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ mt: 0.5 }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : (tab === 0 ? '로그인' : '회원가입')}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">또는</Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogle}
            sx={{ borderColor: '#DB4437', color: '#DB4437', '&:hover': { bgcolor: '#FFF0EE', borderColor: '#DB4437' } }}
          >
            Google로 로그인
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default LoginPage
