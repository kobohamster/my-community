import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Container, TextField, Button, Typography, Alert, CircularProgress, Divider
} from '@mui/material'
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined'
import { supabase } from '../supabase'

const LoginPage = ({ onGuestAccess }) => {
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

  const handleGuest = () => {
    onGuestAccess()
    navigate('/')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, #0d1f3a 0%, #04080f 65%)',
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
              fontSize: { xs: '1.1rem', sm: '1.4rem' },
              color: '#5a9be8',
              textShadow: '0 0 20px rgba(58,123,213,0.7), 0 0 50px rgba(58,123,213,0.3)',
              letterSpacing: '0.05em',
              lineHeight: 1.4,
              mb: 1,
            }}
          >
            UNTIL DAWN
          </Typography>
          <Typography variant="caption" sx={{ color: '#90b4cc', letterSpacing: '0.2em' }}>
            영원히 일을 미루는 모임
          </Typography>
        </Box>

        {/* 로그인 폼 */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            background: 'rgba(8, 15, 30, 0.92)',
            border: '1px solid rgba(58, 123, 213, 0.2)',
            borderRadius: 2,
            p: 4,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
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
              mb: 3,
              borderColor: 'rgba(58,123,213,0.3)',
              color: 'text.secondary',
              '&:hover': { borderColor: '#3a7bd5', color: '#5a9be8' },
            }}
          >
            회원가입하러 가기
          </Button>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', px: 1 }}>
              또는
            </Typography>
          </Divider>

          {/* 둘러보기 버튼 */}
          <Button
            variant="text"
            fullWidth
            startIcon={<RemoveRedEyeOutlinedIcon />}
            onClick={handleGuest}
            sx={{
              color: 'text.disabled',
              fontSize: '0.85rem',
              py: 1,
              border: '1px dashed rgba(58,123,213,0.15)',
              '&:hover': {
                color: 'text.secondary',
                borderColor: 'rgba(58,123,213,0.35)',
                background: 'rgba(58,123,213,0.05)',
              },
            }}
          >
            둘러보기 (3분, 글쓰기 불가)
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default LoginPage
