import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container, Box, Typography, IconButton, Avatar, Chip,
  Divider, TextField, Button, CircularProgress, Alert,
  Rating,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import DeleteIcon from '@mui/icons-material/Delete'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import TasteChart from '../components/TasteChart'

const CACAO_LABELS = { dark: '다크', milk: '밀크', white: '화이트' }
const getCacaoType = (pct) => {
  if (pct == null) return null
  if (pct >= 70) return 'dark'
  if (pct >= 30) return 'milk'
  return 'white'
}

const PostDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session, profile } = useAuth()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchPost = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('chocorate_posts')
      .select('*, profiles(username, profile_image_url)')
      .eq('id', id)
      .single()
    if (err) { setError('게시물을 불러올 수 없습니다.'); return }
    setPost(data)
  }, [id])

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('chocorate_comments')
      .select('*, profiles(username, profile_image_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }, [id])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchPost(), fetchComments()]).finally(() => setLoading(false))
  }, [fetchPost, fetchComments])

  useEffect(() => {
    if (!session) return
    Promise.all([
      supabase.from('chocorate_liked_posts').select('post_id').eq('user_id', session.user.id).eq('post_id', id).maybeSingle(),
      supabase.from('chocorate_bookmarks').select('post_id').eq('user_id', session.user.id).eq('post_id', id).maybeSingle(),
    ]).then(([liked, bookmarked]) => {
      setIsLiked(!!liked.data)
      setIsBookmarked(!!bookmarked.data)
    })
  }, [session, id])

  const handleLike = async () => {
    if (!session || !post) return
    if (isLiked) {
      await supabase.from('chocorate_liked_posts').delete().eq('user_id', session.user.id).eq('post_id', id)
      await supabase.from('chocorate_posts').update({ likes_count: Math.max(0, post.likes_count - 1) }).eq('id', id)
      setPost((p) => ({ ...p, likes_count: p.likes_count - 1 }))
      setIsLiked(false)
    } else {
      await supabase.from('chocorate_liked_posts').insert({ user_id: session.user.id, post_id: id })
      await supabase.from('chocorate_posts').update({ likes_count: post.likes_count + 1 }).eq('id', id)
      setPost((p) => ({ ...p, likes_count: p.likes_count + 1 }))
      setIsLiked(true)
    }
  }

  const handleBookmark = async () => {
    if (!session) return
    if (isBookmarked) {
      await supabase.from('chocorate_bookmarks').delete().eq('user_id', session.user.id).eq('post_id', id)
      setIsBookmarked(false)
    } else {
      await supabase.from('chocorate_bookmarks').insert({ user_id: session.user.id, post_id: id })
      setIsBookmarked(true)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('게시물을 삭제하시겠습니까?')) return
    await supabase.from('chocorate_posts').delete().eq('id', id)
    navigate('/posts')
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !session) return
    setCommentLoading(true)
    const { data } = await supabase
      .from('chocorate_comments')
      .insert({ post_id: id, user_id: session.user.id, content: newComment.trim() })
      .select('*, profiles(username, profile_image_url)')
      .single()
    if (data) setComments((prev) => [...prev, data])
    setNewComment('')
    setCommentLoading(false)
  }

  const handleDeleteComment = async (commentId) => {
    await supabase.from('chocorate_comments').delete().eq('id', commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (error || !post) return <Container maxWidth="sm" sx={{ py: 4 }}><Alert severity="error">{error || '게시물 없음'}</Alert></Container>

  const cacaoType = getCacaoType(post.cacao_percentage)
  const isOwner = session?.user?.id === post.user_id

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 1 }}>
        <ArrowBackIcon />
      </IconButton>

      {post.image_url && (
        <Box
          component="img"
          src={post.image_url}
          alt={post.title}
          sx={{ width: '100%', borderRadius: 2, maxHeight: 320, objectFit: 'cover', mb: 2 }}
        />
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            {cacaoType && (
              <Chip label={`${CACAO_LABELS[cacaoType]} ${post.cacao_percentage}%`} size="small" color="primary" />
            )}
          </Box>
          <Typography variant="h5" fontWeight={700}>{post.title}</Typography>
        </Box>
        {isOwner && (
          <IconButton onClick={handleDeletePost} color="error" size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {post.rating && <Rating value={post.rating} readOnly size="small" sx={{ mb: 1 }} />}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar src={post.profiles?.profile_image_url} sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
          {post.profiles?.username?.[0]?.toUpperCase()}
        </Avatar>
        <Typography variant="body2" color="text.secondary">{post.profiles?.username}</Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(post.created_at).toLocaleDateString('ko-KR')}
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>{post.caption}</Typography>

      {post.hashtags?.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {post.hashtags.map((tag) => (
            <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" color="primary" />
          ))}
        </Box>
      )}

      <TasteChart data={{ sweetness: post.sweetness, saltiness: post.saltiness, sourness: post.sourness, bitterness: post.bitterness, umami: post.umami }} />

      <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
        <Button
          variant={isLiked ? 'contained' : 'outlined'}
          startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          onClick={handleLike}
          disabled={!session}
          size="small"
          color={isLiked ? 'error' : 'inherit'}
          sx={isLiked ? {} : { borderColor: 'divider' }}
        >
          {post.likes_count}
        </Button>
        <Button
          variant={isBookmarked ? 'contained' : 'outlined'}
          startIcon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          onClick={handleBookmark}
          disabled={!session}
          size="small"
          color={isBookmarked ? 'primary' : 'inherit'}
          sx={isBookmarked ? {} : { borderColor: 'divider' }}
        >
          북마크
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        댓글 {comments.length}
      </Typography>

      {comments.map((c) => (
        <Box key={c.id} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Avatar src={c.profiles?.profile_image_url} sx={{ width: 28, height: 28, fontSize: '0.7rem', flexShrink: 0 }}>
            {c.profiles?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" fontWeight={600}>{c.profiles?.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(c.created_at).toLocaleDateString('ko-KR')}
              </Typography>
              {session?.user?.id === c.user_id && (
                <IconButton size="small" onClick={() => handleDeleteComment(c.id)} sx={{ ml: 'auto', p: 0 }}>
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>
            <Typography variant="body2">{c.content}</Typography>
          </Box>
        </Box>
      ))}

      {session ? (
        <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            size="small"
            placeholder="댓글을 입력하세요"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            fullWidth
            multiline
            maxRows={3}
          />
          <Button type="submit" variant="contained" size="small" disabled={!newComment.trim() || commentLoading} sx={{ minWidth: 56 }}>
            등록
          </Button>
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">로그인 후 댓글을 작성할 수 있습니다.</Typography>
      )}
    </Container>
  )
}

export default PostDetailPage
