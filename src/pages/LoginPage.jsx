import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Container, TextField, Button, Typography, Alert, CircularProgress
} from '@mui/material'
import { supabase } from '../supabase'

const LoginPage = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    setIsLoading(true)
    setError('')

    const email = `${username.trim().toLowerCase()}@untildawn.local`
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    } else {
      navigate('/')
    }
    setIsLoading(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #0d1b35 0%, #0a0d1a 60%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="xs">
        {/* 로고 */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            sx={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              color: '#e8c84a',
              textShadow: '0 0 20px rgba(232,200,74,0.6), 0 0 40px rgba(232,200,74,0.3)',
              letterSpacing: '0.05em',
              lineHeight: 1.4,
              mb: 1,
            }}
          >
            UNTIL DAWN
          </Typography>
          <Typography variant="caption" sx={{ color: '#8090a8', letterSpacing: '0.2em' }}>
            영원히 일을 미루는 모임
          </Typography>
        </Box>

        {/* 로그인 폼 */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            background: 'rgba(17, 20, 40, 0.9)',
            border: '1px solid rgba(232, 200, 74, 0.2)',
            borderRadius: 2,
            p: 4,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="h4" sx={{ mb: 3, color: 'text.primary', textAlign: 'center' }}>
            로그인
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>
              {error}
            </Alert>
          )}

          <TextField
            label="아이디"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
            autoComplete="username"
          />
          <TextField
            label="비밀번호"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ mb: 2, py: 1.2 }}
          >
            {isLoading ? <CircularProgress size={22} color="inherit" /> : '로그인'}
          </Button>

          <Button
            component={Link}
            to="/signup"
            variant="outlined"
            fullWidth
            sx={{
              borderColor: 'rgba(232,200,74,0.3)',
              color: 'text.secondary',
              '&:hover': { borderColor: '#e8c84a', color: '#e8c84a' },
            }}
          >
            회원가입하러 가기
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default LoginPage
