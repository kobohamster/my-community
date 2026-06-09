import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Button, Card, CardActionArea,
  CardContent, Grid, Chip, CircularProgress, Divider
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
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

const PostListPage = ({ session, profile }) => {
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
    <Box
      sx={{
        minHeight: '100vh',
        background: '#0a0d1a',
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(232,200,74,0.12)',
          background: 'rgba(10,13,26,0.95)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '0.9rem',
                color: '#e8c84a',
                textShadow: '0 0 10px rgba(232,200,74,0.4)',
              }}
            >
              UNTIL DAWN
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                {profile?.name}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  borderColor: 'rgba(232,200,74,0.2)',
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  '&:hover': { borderColor: '#e8c84a', color: '#e8c84a' },
                }}
              >
                로그아웃
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* 타이틀 + 글쓰기 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h2" sx={{ color: 'text.primary', mb: 0.5 }}>
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
            sx={{ whiteSpace: 'nowrap' }}
          >
            글쓰기
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#e8c84a' }} />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: 'text.secondary', mb: 1 }}>아직 게시물이 없습니다.</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              첫 번째 썰을 풀어보세요
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
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
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h4"
                            sx={{
                              mb: 1,
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
                              mb: 2,
                            }}
                          >
                            {post.content}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              {post.profiles?.name || post.profiles?.username}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                {formatDate(post.created_at)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <VisibilityIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
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
                              background: 'rgba(232,200,74,0.1)',
                              color: '#e8c84a',
                              border: '1px solid rgba(232,200,74,0.3)',
                              fontSize: '0.75rem',
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
