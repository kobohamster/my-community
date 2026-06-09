import { Box, Container, Typography, Button } from '@mui/material'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import { supabase } from '../supabase'

const PendingPage = ({ profile }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut()
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
        <Box
          sx={{
            background: 'rgba(17, 20, 40, 0.9)',
            border: '1px solid rgba(232, 200, 74, 0.2)',
            borderRadius: 2,
            p: 5,
            textAlign: 'center',
          }}
        >
          <HourglassEmptyIcon sx={{ fontSize: 48, color: '#e8c84a', mb: 2, opacity: 0.8 }} />
          <Typography variant="h3" sx={{ mb: 2 }}>
            승인 대기 중
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            {profile?.name}님의 가입 신청이 접수되었습니다.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            관리자 승인 후 커뮤니티를 이용하실 수 있습니다.
          </Typography>
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{ borderColor: 'rgba(232,200,74,0.3)', color: 'text.secondary' }}
          >
            로그아웃
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default PendingPage
