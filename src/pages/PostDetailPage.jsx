import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Container, Typography, Button, CircularProgress,
  Divider, IconButton, Chip
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { supabase } from '../supabase'

const formatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const PostDetailPage = ({ session, profile }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDoingItNow, setIsDoingItNow] = useState(false)
  const [justDid, setJustDid] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true)

      // 조회수 증가
      await supabase.rpc('increment_view_count', { post_id: Number(id) })

      const { data } = await supabase
        .from('posts')
        .select(`
          id, title, content, image_url,
          view_count, do_it_now_count, created_at,
          profiles!posts_user_id_fkey (username, name)
        `)
        .eq('id', id)
        .single()

      setPost(data)
      setIsLoading(false)
    }
    fetchPost()
  }, [id])

  const handleDoItNow = async () => {
    if (isDoingItNow) return
    setIsDoingItNow(true)

    const { data } = await supabase.rpc('increment_do_it_now', { post_id: Number(id) })

    if (data !== null) {
      setPost((prev) => ({ ...prev, do_it_now_count: data }))
      setJustDid(true)
      setTimeout(() => setJustDid(false), 2000)
    }
    setIsDoingItNow(false)
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
          <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography
              sx={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '0.9rem',
                color: '#5a9be8',
                textShadow: '0 0 10px rgba(58,123,213,0.4)',
              }}
            >
              UNTIL DAWN
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 5 }}>
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#5a9be8' }} />
          </Box>
        ) : !post ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: 'text.secondary' }}>게시물을 찾을 수 없습니다.</Typography>
            <Button onClick={() => navigate('/')} sx={{ mt: 2, color: '#5a9be8' }}>
              목록으로
            </Button>
          </Box>
        ) : (
          <>
            {/* 제목 */}
            <Typography variant="h1" sx={{ mb: 2, lineHeight: 1.4 }}>
              {post.title}
            </Typography>

            {/* 메타 정보 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#5a9be8' }}>
                {post.profiles?.name || post.profiles?.username}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {formatDate(post.created_at)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VisibilityIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {post.view_count}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* 이미지 */}
            {post.image_url && (
              <Box sx={{ mb: 4 }}>
                <Box
                  component="img"
                  src={post.image_url}
                  alt="게시물 이미지"
                  sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 1 }}
                />
              </Box>
            )}

            {/* 내용 */}
            <Typography
              variant="body1"
              sx={{
                color: 'text.primary',
                lineHeight: 1.9,
                whiteSpace: 'pre-wrap',
                mb: 6,
              }}
            >
              {post.content}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            {/* Do it now 버튼 */}
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Button
                variant="contained"
                onClick={handleDoItNow}
                disabled={isDoingItNow}
                sx={{
                  px: 5,
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  background: justDid
                    ? 'linear-gradient(135deg, #5a9e72 0%, #3d7a55 100%)'
                    : 'linear-gradient(135deg, #5a9be8 0%, #1a5aaa 100%)',
                  color: '#04080f',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {justDid ? '✅ 했어요!' : '✊ Do it now'}
              </Button>

              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`${post.do_it_now_count}명이 지금 하러 갔습니다`}
                  sx={{
                    background: 'rgba(58,123,213,0.08)',
                    color: post.do_it_now_count > 0 ? '#5a9be8' : 'text.disabled',
                    border: `1px solid ${post.do_it_now_count > 0 ? 'rgba(58,123,213,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    fontSize: '0.8rem',
                  }}
                />
              </Box>
            </Box>

            {/* 뒤로가기 */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ color: 'text.secondary' }}
              >
                뒤로 가기
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  )
}

export default PostDetailPage
