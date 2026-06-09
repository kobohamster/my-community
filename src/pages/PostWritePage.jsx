import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const PostWritePage = ({ session, profile }) => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddImage = () => {
    setImageUrl(getRandomImage())
  }

  const handleRefreshImage = () => {
    setImageUrl(getRandomImage())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setIsLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('posts').insert({
      user_id: session.user.id,
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl || null,
    })

    if (insertError) {
      setError('게시물 등록에 실패했습니다.')
    } else {
      navigate('/')
    }
    setIsLoading(false)
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
              sx={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: { xs: '0.7rem', sm: '0.9rem' },
                color: '#5a9be8',
                textShadow: '0 0 10px rgba(58,123,213,0.4)',
              }}
            >
              UNTIL DAWN
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h2" sx={{ mb: { xs: 3, sm: 4 }, fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>글쓰기</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="제목"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="오늘은 뭘 안 했나요?"
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
            placeholder="썰을 풀어보세요..."
            sx={{ mb: 3 }}
          />

          {/* 이미지 영역 */}
          {imageUrl ? (
            <Box sx={{ mb: 3, position: 'relative' }}>
              <Card sx={{ overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  image={imageUrl}
                  alt="랜덤 이미지"
                  sx={{ maxHeight: 300, objectFit: 'cover' }}
                />
              </Card>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefreshImage}
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
              onClick={handleAddImage}
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
              disabled={isLoading || !title.trim() || !content.trim()}
              sx={{ px: 4 }}
            >
              {isLoading ? <CircularProgress size={22} color="inherit" /> : '게시물 등록'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default PostWritePage
