import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Button, Card, CardActionArea,
  CardContent, Grid, Chip, CircularProgress, Divider, Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import { supabase } from '../supabase'

const formatDate = (iso) => {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '방금 전'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const formatSeconds = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

const PostListPage = ({ session, profile, isGuest, guestSecondsLeft }) => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      const { data } = await supabase
        .from('posts')
        .select(`
          id, title, content, image_url,
          view_count, do_it_now_count, created_at,
          profiles!posts_user_id_fkey (username, name)
        `)
        .order('created_at', { ascending: false })
      setPosts(data || [])
      setIsLoading(false)
    }
    fetchPosts()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#04080f' }}>
      {/* 헤더 */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(58,123,213,0.12)',
          background: 'rgba(4,8,15,0.95)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              py: { xs: 1.5, sm: 2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              onClick={() => navigate('/')}
              sx={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: { xs: '0.7rem', sm: '0.9rem' },
                color: '#5a9be8',
                textShadow: '0 0 10px rgba(58,123,213,0.5)',
                cursor: 'pointer',
                '&:hover': { color: '#7db8f0' },
              }}
            >
              UNTIL DAWN
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {isGuest ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimerOutlinedIcon
                    sx={{ fontSize: 14, color: guestSecondsLeft < 60 ? '#c05070' : 'text.disabled' }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: guestSecondsLeft < 60 ? '#c05070' : 'text.disabled',
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatSeconds(guestSecondsLeft)}
                  </Typography>
                </Box>
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    mr: 1,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {profile?.name}
                </Typography>
              )}

              {isGuest ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{ borderColor: 'rgba(58,123,213,0.4)', color: '#5a9be8', fontSize: '0.75rem' }}
                >
                  로그인
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleLogout}
                  sx={{
                    borderColor: 'rgba(58,123,213,0.2)',
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    '&:hover': { borderColor: '#3a7bd5', color: '#5a9be8' },
                  }}
                >
                  로그아웃
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {/* 게스트 안내 배너 */}
        {isGuest && (
          <Alert
            severity="info"
            icon={<TimerOutlinedIcon />}
            sx={{
              mb: 3,
              background: 'rgba(58,123,213,0.08)',
              border: '1px solid rgba(58,123,213,0.2)',
              color: 'text.secondary',
              '& .MuiAlert-icon': { color: '#3a7bd5' },
            }}
          >
            둘러보기 중 — 남은 시간{' '}
            <strong style={{ color: guestSecondsLeft < 60 ? '#c05070' : '#5a9be8' }}>
              {formatSeconds(guestSecondsLeft)}
            </strong>{' '}
            / 글쓰기는 로그인 후 이용 가능
          </Alert>
        )}

        {/* 타이틀 + 글쓰기 버튼 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h2" sx={{ mb: 0.5, fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
              게시물 목록
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              해야 할 일 안 하고 놀은 거 공유하는 공간
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/write')}
            disabled={isGuest}
            sx={{
              whiteSpace: 'nowrap',
              alignSelf: { xs: 'flex-end', sm: 'auto' },
              ...(isGuest && { opacity: 0.4 }),
            }}
          >
            글쓰기
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#3a7bd5' }} />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: 'text.secondary', mb: 1 }}>아직 게시물이 없습니다.</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              첫 번째 썰을 풀어보세요
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {posts.map((post) => (
              <Grid item xs={12} key={post.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <CardActionArea onClick={() => navigate(`/post/${post.id}`)}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h4"
                            sx={{
                              mb: 0.8,
                              fontSize: { xs: '0.95rem', sm: '1.1rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {post.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mb: 1.5,
                              display: { xs: 'none', sm: 'block' },
                            }}
                          >
                            {post.content}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              {post.profiles?.name || post.profiles?.username}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 14, color: 'rgb(192, 212, 232)' }} />
                              <Typography variant="caption" sx={{ color: 'rgb(192, 212, 232)' }}>
                                {formatDate(post.created_at)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <VisibilityIcon sx={{ fontSize: 14, color: 'rgb(192, 212, 232)' }} />
                              <Typography variant="caption" sx={{ color: 'rgb(192, 212, 232)' }}>
                                {post.view_count}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        {post.do_it_now_count > 0 && (
                          <Chip
                            label={`✊ ${post.do_it_now_count}`}
                            size="small"
                            sx={{
                              background: 'rgba(58,123,213,0.1)',
                              color: '#5a9be8',
                              border: '1px solid rgba(58,123,213,0.3)',
                              fontSize: '0.7rem',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  )
}

export default PostListPage
