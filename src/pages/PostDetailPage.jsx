import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Container, Typography, Button, CircularProgress,
  Divider, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined'
import { supabase } from '../supabase'

const formatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const PostDetailPage = ({ session, profile, isGuest }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDoingItNow, setIsDoingItNow] = useState(false)
  const [justDid, setJustDid] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true)
      await supabase.rpc('increment_view_count', { post_id: Number(id) })
      const { data } = await supabase
        .from('posts')
        .select(`
          id, title, content, image_url, user_id,
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

  const handleDelete = async () => {
    setIsDeleting(true)
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (!error) {
      navigate('/')
    }
    setIsDeleting(false)
  }

  const isAuthor = session?.user?.id === post?.user_id

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
                textShadow: '0 0 10px rgba(58,123,213,0.5)',
                cursor: 'pointer',
                '&:hover': { color: '#7db8f0' },
              }}
            >
              UNTIL DAWN
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 }, px: { xs: 2, sm: 3 } }}>
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#3a7bd5' }} />
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
            {/* 제목 + 삭제 버튼 */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <Typography
                variant="h1"
                sx={{ lineHeight: 1.4, fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2rem' }, flex: 1 }}
              >
                {post.title}
              </Typography>
              {isAuthor && (
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                  <IconButton
                    onClick={() => navigate(`/post/${id}/edit`)}
                    sx={{
                      color: 'text.disabled',
                      '&:hover': { color: '#5a9be8', background: 'rgba(58,123,213,0.08)' },
                    }}
                    title="게시물 수정"
                  >
                    <ModeEditOutlinedIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setIsDeleteDialogOpen(true)}
                    sx={{
                      color: 'text.disabled',
                      '&:hover': { color: '#c05070', background: 'rgba(192,80,112,0.08)' },
                    }}
                    title="게시물 삭제"
                  >
                    <DeleteOutlinedIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* 메타 정보 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, mb: 4, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#5a9be8', fontWeight: 600 }}>
                {post.profiles?.name || post.profiles?.username}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {formatDate(post.created_at)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VisibilityIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
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
                  sx={{
                    width: '100%',
                    maxHeight: { xs: 220, sm: 320, md: 400 },
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
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
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
              }}
            >
              {post.content}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            {/* Do it now 버튼 */}
            <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
              <Button
                variant="contained"
                onClick={handleDoItNow}
                disabled={isDoingItNow}
                sx={{
                  px: { xs: 4, sm: 6 },
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  background: justDid
                    ? 'linear-gradient(135deg, #4a8e6a 0%, #2d6a4a 100%)'
                    : 'linear-gradient(135deg, #3a7bd5 0%, #1a5aaa 100%)',
                  color: '#e8f0fa',
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'scale(1.05)' },
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
                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
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

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: '#080f1e',
            border: '1px solid rgba(58,123,213,0.2)',
            borderRadius: 2,
            minWidth: 280,
          },
        }}
      >
        <DialogTitle sx={{ color: 'text.primary', fontSize: '1rem' }}>
          게시물을 삭제할까요?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            삭제한 게시물은 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            취소
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            sx={{
              color: '#c05070',
              '&:hover': { background: 'rgba(192,80,112,0.08)' },
            }}
          >
            {isDeleting ? <CircularProgress size={18} sx={{ color: '#c05070' }} /> : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PostDetailPage
