import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Container, TextField, Button, Typography, Alert,
  CircularProgress, InputAdornment, IconButton, LinearProgress
} from '@mui/material'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { supabase } from '../supabase'

const getPasswordStrength = (pw) => {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const strengthLabels = ['', '약함', '보통', '강함', '매우 강함']
const strengthColors = ['', '#c05070', '#d4884a', '#4a8e6a', '#3a7bd5']

const SignupPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [usernameStatus, setUsernameStatus] = useState('idle')
  const [usernameMessage, setUsernameMessage] = useState('')

  const handleCheckUsername = async () => {
    const val = username.trim().toLowerCase()
    if (!val) return
    setUsernameStatus('checking')
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', val)
      .maybeSingle()
    if (data) {
      setUsernameStatus('taken')
      setUsernameMessage('이미 사용 중인 아이디입니다.')
    } else {
      setUsernameStatus('available')
      setUsernameMessage('사용 가능한 아이디입니다.')
    }
  }

  const canProceedStep0 = name.trim() && username.trim() && usernameStatus === 'available'
  const canSubmit = password.length >= 8 && getPasswordStrength(password) >= 2

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setIsLoading(true)
    setError('')

    const email = `${username.trim().toLowerCase()}@untildawn.local`
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim().toLowerCase(),
          name: name.trim(),
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
    } else {
      navigate('/')
    }
    setIsLoading(false)
  }

  const pwStrength = getPasswordStrength(password)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, #0d1f3a 0%, #04080f 65%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            sx={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '1.1rem',
              color: '#5a9be8',
              textShadow: '0 0 15px rgba(58,123,213,0.6)',
              mb: 1,
            }}
          >
            UNTIL DAWN
          </Typography>
        </Box>

        <Box
          sx={{
            background: 'rgba(8, 15, 30, 0.92)',
            border: '1px solid rgba(58, 123, 213, 0.2)',
            borderRadius: 2,
            p: 4,
          }}
        >
          <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
            회원가입
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>
              {error}
            </Alert>
          )}

          {/* Step 0: 이름 + 아이디 */}
          {step === 0 && (
            <Box>
              <TextField
                label="이름"
                fullWidth
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="아이디"
                  fullWidth
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setUsernameStatus('idle')
                    setUsernameMessage('')
                  }}
                  error={usernameStatus === 'taken'}
                  helperText={usernameMessage}
                  FormHelperTextProps={{
                    sx: { color: usernameStatus === 'available' ? '#4a8e6a' : 'error.main' },
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleCheckUsername}
                  disabled={!username.trim() || usernameStatus === 'checking'}
                  sx={{
                    minWidth: 80,
                    borderColor: 'rgba(58,123,213,0.3)',
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    '&:hover': { borderColor: '#3a7bd5', color: '#5a9be8' },
                  }}
                >
                  {usernameStatus === 'checking' ? (
                    <CircularProgress size={16} />
                  ) : usernameStatus === 'available' ? (
                    <CheckCircleOutlinedIcon sx={{ color: '#4a8e6a' }} />
                  ) : (
                    '중복확인'
                  )}
                </Button>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={() => setStep(1)}
                disabled={!canProceedStep0}
                sx={{ mt: 3, py: 1.2 }}
              >
                다음
              </Button>
            </Box>
          )}

          {/* Step 1: 비밀번호 */}
          {step === 1 && (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* 비밀번호 강도 */}
              <Box sx={{ mb: 4 }}>
                <LinearProgress
                  variant="determinate"
                  value={(pwStrength / 4) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    mb: 0.5,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: strengthColors[pwStrength] || '#2a3d50',
                      borderRadius: 3,
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: strengthColors[pwStrength] || 'text.disabled' }}>
                    {password ? strengthLabels[pwStrength] : '비밀번호를 입력하세요'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    영문 대문자·숫자·특수문자 포함 권장
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setStep(0)}
                  sx={{ borderColor: 'rgba(58,123,213,0.2)', color: 'text.secondary' }}
                >
                  이전
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading || !canSubmit}
                  sx={{ py: 1.2 }}
                >
                  {isLoading ? <CircularProgress size={22} color="inherit" /> : '가입하기'}
                </Button>
              </Box>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              이미 계정이 있으신가요?{' '}
              <Link to="/login" style={{ color: '#5a9be8', textDecoration: 'none' }}>
                로그인
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default SignupPage
