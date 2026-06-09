import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Container, Typography, TextField, Button, CircularProgress,
  Alert, Card, CardMedia, IconButton
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ImageIcon from '@mui/icons-material/Image'
import RefreshIcon from '@mui/icons-material/Refresh'
import { supabase } from '../supabase'

const PICSUM_BASE = 'https://picsum.photos/seed'

const getRandomImage = () => {
  const seed = Math.random().toString(36).substring(2, 10)
  return `${PICSUM_BASE}/${seed}/800/400`
}

const PostEditPage = ({ session }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, image_url, user_id')
        .eq('id', id)
        .single()

      if (error || !data) {
        navigate('/')
        return
      }
      if (data.user_id !== session.user.id) {
        navigate(`/post/${id}`)
        return
      }
      setTitle(data.title)
      setContent(data.content)
      setImageUrl(data.image_url || '')
      setIsLoading(false)
    }
    fetchPost()
  }, [id, session, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setIsSaving(true)
    setError('')

    const { error: updateError } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl || null,
      })
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (updateError) {
      setError('수정에 실패했습니다.')
    } else {
      navigate(`/post/${id}`)
    }
    setIsSaving(false)
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
          <Box sx={{ py: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.secondary', p: { xs: 0.5, sm: 1 } }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography
              onClick={() => navigate('/')}
              sx={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: { xs: '0.7rem', sm: '0.9rem' },
                color: '#5a9be8',
                textShadow: '0 0 10px rgba(58,123,213,0.4)',
                cursor: 'pointer',
                '&:hover': { color: '#7db8f0' },
              }}
            >
              UNTIL DAWN
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#3a7bd5' }} />
          </Box>
        ) : (
          <>
            <Typography variant="h2" sx={{ mb: { xs: 3, sm: 4 }, fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
              글 수정
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="제목"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 3 }}
              />

              <TextField
                label="내용"
                fullWidth
                required
                multiline
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{ mb: 3 }}
              />

              {/* 이미지 영역 */}
              {imageUrl ? (
                <Box sx={{ mb: 3 }}>
                  <Card sx={{ overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      image={imageUrl}
                      alt="게시물 이미지"
                      sx={{ maxHeight: 300, objectFit: 'cover' }}
                    />
                  </Card>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={() => setImageUrl(getRandomImage())}
                      sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                      다른 이미지
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setImageUrl('')}
                      sx={{ color: 'text.disabled', fontSize: '0.75rem' }}
                    >
                      이미지 제거
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  onClick={() => setImageUrl(getRandomImage())}
                  sx={{
                    mb: 3,
                    borderColor: 'rgba(58,123,213,0.2)',
                    color: 'text.secondary',
                    '&:hover': { borderColor: '#5a9be8', color: '#5a9be8' },
                  }}
                >
                  랜덤 이미지 추가
                </Button>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  sx={{ borderColor: 'rgba(58,123,213,0.2)', color: 'text.secondary' }}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSaving || !title.trim() || !content.trim()}
                  sx={{ px: 4 }}
                >
                  {isSaving ? <CircularProgress size={22} color="inherit" /> : '수정 완료'}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  )
}

export default PostEditPage
