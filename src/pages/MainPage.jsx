import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Button, Grid, Card,
  CardActionArea, CardContent,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditNoteIcon from '@mui/icons-material/EditNote'
import { useAuth } from '../contexts/AuthContext'

const CATEGORIES = [
  { label: '다크 초콜릿', sub: '카카오 70~100%', emoji: '🍫', filter: 'dark', bg: '#402A1E', color: 'white' },
  { label: '밀크 초콜릿', sub: '카카오 30~70%', emoji: '🟫', filter: 'milk', bg: '#C4865A', color: 'white' },
  { label: '화이트 초콜릿', sub: '카카오 0~30%', emoji: '⬜', filter: 'white', bg: '#F5E6C8', color: '#2C1810' },
]

const MainPage = () => {
  const navigate = useNavigate()
  const { session } = useAuth()

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 6,
          px: 2,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #402A1E 0%, #6B4C3B 100%)',
        }}
      >
        <Typography variant="h3" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, fontWeight: 700, mb: 1 }}>
          🍫 chocorate
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85, mb: 3, maxWidth: 360, mx: 'auto' }}>
          초콜릿을 사랑하는 사람들의 솔직한 리뷰 커뮤니티
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/posts')}
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'secondary.light' } }}
          >
            리뷰 둘러보기
          </Button>
          {session ? (
            <Button
              variant="outlined"
              startIcon={<EditNoteIcon />}
              onClick={() => navigate('/write')}
              sx={{ borderColor: 'rgba(255,255,255,0.6)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              리뷰 작성하기
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{ borderColor: 'rgba(255,255,255,0.6)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              로그인하고 시작하기
            </Button>
          )}
        </Box>
      </Box>

      {/* Categories */}
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          초콜릿 종류별 리뷰
        </Typography>
        <Grid container spacing={1.5}>
          {CATEGORIES.map((cat) => (
            <Grid item xs={4} key={cat.filter}>
              <Card sx={{ borderRadius: 2 }}>
                <CardActionArea onClick={() => navigate(`/posts?type=${cat.filter}`)}>
                  <CardContent sx={{ textAlign: 'center', py: 2, bgcolor: cat.bg }}>
                    <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{cat.emoji}</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: cat.color, fontSize: '0.8rem' }}>
                      {cat.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: cat.color, opacity: 0.75, fontSize: '0.65rem' }}>
                      {cat.sub}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Feature intro */}
        <Box sx={{ mt: 4, p: 2.5, bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 6px rgba(64,42,30,0.07)' }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>chocorate란?</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              { icon: '📸', title: '이미지 리뷰', desc: 'Unsplash의 초콜릿 사진으로 시각적인 리뷰를 남겨보세요.' },
              { icon: '⭐', title: '별점과 맛 프로필', desc: '단맛·쓴맛·신맛 등 5가지 맛을 레이더 차트로 표현해요.' },
              { icon: '🔖', title: '북마크', desc: '마음에 드는 초콜릿 리뷰를 아카이빙해 보세요.' },
            ].map((f) => (
              <Box key={f.icon} sx={{ display: 'flex', gap: 1.5 }}>
                <Typography sx={{ fontSize: '1.2rem', mt: 0.2 }}>{f.icon}</Typography>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{f.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{f.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default MainPage
