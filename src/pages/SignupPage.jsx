import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Container, TextField, Button, Typography, Alert,
  CircularProgress, Stepper, Step, StepLabel, InputAdornment,
  IconButton, LinearProgress
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { supabase } from '../supabase'

const MIN_AGE = 15

const calcAge = (birthday) => {
  if (!birthday) return 0
  const today = new Date()
  const birth = new Date(birthday)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

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
const strengthColors = ['', '#cf6679', '#e8a84a', '#5a9e72', '#e8c84a']

const SignupPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    birthday: '',
    purpose: '',
  })
  const [usernameStatus, setUsernameStatus] = useState('idle')
  const [usernameMessage, setUsernameMessage] = useState('')

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (field === 'username') {
      setUsernameStatus('idle')
      setUsernameMessage('')
    }
  }

  const handleCheckUsername = async () => {
    const username = form.username.trim().toLowerCase()
    if (!username) return
    setUsernameStatus('checking')
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()
    if (data) {
      setUsernameStatus('taken')
      setUsernameMessage('이미 사용 중인 아이디입니다.')
    } else {
      setUsernameStatus('available')
      setUsernameMessage('사용 가능한 아이디입니다.')
    }
  }

  const canProceedStep0 = form.name.trim() && form.username.trim() && usernameStatus === 'available'
  const canProceedStep1 = form.password.length >= 8 && getPasswordStrength(form.password) >= 2

  const handleStep1 = () => {
    if (!canProceedStep0) return
    setStep(1)
  }

  const handleStep2 = () => {
    if (!canProceedStep1) return
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const age = calcAge(form.birthday)
    if (age < MIN_AGE) {
      setError(`만 ${MIN_AGE}세 이상만 가입할 수 있습니다.`)
      return
    }
    if (!form.purpose.trim()) {
      setError('가입 목적을 입력해 주세요.')
      return
    }
    setIsLoading(true)
    setError('')

    const email = `${form.username.trim().toLowerCase()}@untildawn.local`
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: {
          username: form.username.trim().toLowerCase(),
          name: form.name.trim(),
          birthday: form.birthday,
          purpose: form.purpose.trim(),
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
    } else {
      navigate('/pending')
    }
    setIsLoading(false)
  }

  const pwStrength = getPasswordStrength(form.password)
  const age = calcAge(form.birthday)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #0d1b35 0%, #0a0d1a 60%)',
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
              color: '#e8c84a',
              textShadow: '0 0 15px rgba(232,200,74,0.5)',
              mb: 1,
            }}
          >
            UNTIL DAWN
          </Typography>
        </Box>

        <Box
          sx={{
            background: 'rgba(17, 20, 40, 0.9)',
            border: '1px solid rgba(232, 200, 74, 0.2)',
            borderRadius: 2,
            p: 4,
          }}
        >
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
            회원가입
          </Typography>

          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {['기본 정보', '비밀번호', '가입 목적'].map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': { fontSize: '0.75rem', color: 'text.secondary' },
                    '& .MuiStepIcon-root.Mui-active': { color: '#e8c84a' },
                    '& .MuiStepIcon-root.Mui-completed': { color: '#5a9e72' },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>
              {error}
            </Alert>
          )}

          {/* Step 0: 이름, 아이디 */}
          {step === 0 && (
            <Box>
              <TextField
                label="이름"
                fullWidth
                required
                value={form.name}
                onChange={handleChange('name')}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="아이디"
                  fullWidth
                  required
                  value={form.username}
                  onChange={handleChange('username')}
                  error={usernameStatus === 'taken'}
                  helperText={usernameMessage}
                  FormHelperTextProps={{
                    sx: { color: usernameStatus === 'available' ? '#5a9e72' : 'error.main' }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleCheckUsername}
                  disabled={!form.username.trim() || usernameStatus === 'checking'}
                  sx={{
                    minWidth: 80,
                    borderColor: 'rgba(232,200,74,0.3)',
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    '&:hover': { borderColor: '#e8c84a', color: '#e8c84a' },
                  }}
                >
                  {usernameStatus === 'checking' ? (
                    <CircularProgress size={16} />
                  ) : usernameStatus === 'available' ? (
                    <CheckCircleOutlineIcon sx={{ color: '#5a9e72' }} />
                  ) : (
                    '중복확인'
                  )}
                </Button>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleStep1}
                disabled={!canProceedStep0}
                sx={{ mt: 2, py: 1.2 }}
              >
                다음
              </Button>
            </Box>
          )}

          {/* Step 1: 비밀번호 */}
          {step === 1 && (
            <Box>
              <TextField
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={form.password}
                onChange={handleChange('password')}
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
              <Box sx={{ mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={(pwStrength / 4) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    mb: 0.5,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: strengthColors[pwStrength] || '#404860',
                      borderRadius: 3,
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: strengthColors[pwStrength] || 'text.disabled' }}>
                    {form.password ? strengthLabels[pwStrength] : '비밀번호를 입력하세요'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    영문 대문자 · 숫자 · 특수문자 포함 권장
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setStep(0)}
                  sx={{ borderColor: 'rgba(232,200,74,0.2)', color: 'text.secondary' }}
                >
                  이전
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleStep2}
                  disabled={!canProceedStep1}
                  sx={{ py: 1.2 }}
                >
                  다음
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 2: 생일, 가입 목적 */}
          {step === 2 && (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="생년월일"
                type="date"
                fullWidth
                required
                value={form.birthday}
                onChange={handleChange('birthday')}
                InputLabelProps={{ shrink: true }}
                error={form.birthday !== '' && age < MIN_AGE}
                helperText={
                  form.birthday !== '' && age < MIN_AGE
                    ? `만 ${MIN_AGE}세 이상만 가입 가능합니다`
                    : form.birthday
                    ? `만 ${age}세`
                    : ''
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="가입 목적"
                multiline
                rows={3}
                fullWidth
                required
                value={form.purpose}
                onChange={handleChange('purpose')}
                placeholder="왜 이 모임에 들어오고 싶으신가요?"
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setStep(1)}
                  sx={{ borderColor: 'rgba(232,200,74,0.2)', color: 'text.secondary' }}
                >
                  이전
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading || (form.birthday !== '' && age < MIN_AGE)}
                  sx={{ py: 1.2 }}
                >
                  {isLoading ? <CircularProgress size={22} color="inherit" /> : '가입 신청'}
                </Button>
              </Box>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              이미 계정이 있으신가요?{' '}
              <Link to="/login" style={{ color: '#e8c84a', textDecoration: 'none' }}>
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
