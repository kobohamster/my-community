import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, IconButton, Chip, Box, Avatar, Tooltip,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import StarIcon from '@mui/icons-material/Star'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'

const CACAO_LABELS = { dark: '다크', milk: '밀크', white: '화이트' }

const getCacaoType = (pct) => {
  if (pct == null) return null
  if (pct >= 70) return 'dark'
  if (pct >= 30) return 'milk'
  return 'white'
}

const getCacaoColor = (type) => ({
  dark: '#402A1E',
  milk: '#C4865A',
  white: '#F5E6C8',
}[type] ?? '#BDBFAA')

const PostCard = ({ post, isLiked, isBookmarked, onLikeChange, onBookmarkChange }) => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [likeLoading, setLikeLoading] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  const cacaoType = getCacaoType(post.cacao_percentage)

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!session || likeLoading) return
    setLikeLoading(true)
    try {
      if (isLiked) {
        await supabase.from('chocorate_liked_posts')
          .delete().eq('user_id', session.user.id).eq('post_id', post.id)
        await supabase.from('chocorate_posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) }).eq('id', post.id)
        onLikeChange?.(post.id, false, post.likes_count - 1)
      } else {
        await supabase.from('chocorate_liked_posts')
          .insert({ user_id: session.user.id, post_id: post.id })
        await supabase.from('chocorate_posts')
          .update({ likes_count: post.likes_count + 1 }).eq('id', post.id)
        onLikeChange?.(post.id, true, post.likes_count + 1)
      }
    } finally {
      setLikeLoading(false)
    }
  }

  const handleBookmark = async (e) => {
    e.stopPropagation()
    if (!session || bookmarkLoading) return
    setBookmarkLoading(true)
    try {
      if (isBookmarked) {
        await supabase.from('chocorate_bookmarks')
          .delete().eq('user_id', session.user.id).eq('post_id', post.id)
        onBookmarkChange?.(post.id, false)
      } else {
        await supabase.from('chocorate_bookmarks')
          .insert({ user_id: session.user.id, post_id: post.id })
        onBookmarkChange?.(post.id, true)
      }
    } finally {
      setBookmarkLoading(false)
    }
  }

  return (
    <Card
      onClick={() => navigate(`/posts/${post.id}`)}
      sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {post.image_url && (
        <CardMedia
          component="img"
          image={post.image_url}
          alt={post.title}
          sx={{ height: 180, objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ flex: 1, pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {cacaoType && (
            <Chip
              label={`${CACAO_LABELS[cacaoType]} ${post.cacao_percentage}%`}
              size="small"
              sx={{ bgcolor: getCacaoColor(cacaoType), color: cacaoType === 'dark' ? 'white' : '#2C1810', fontSize: '0.7rem' }}
            />
          )}
          {post.rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <StarIcon sx={{ fontSize: 14, color: '#F5A623' }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{post.rating}</Typography>
            </Box>
          )}
        </Box>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom noWrap>
          {post.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {post.caption}
        </Typography>
        {post.hashtags?.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {post.hashtags.slice(0, 3).map((tag) => (
              <Typography key={tag} variant="caption" color="secondary.dark" sx={{ fontSize: '0.7rem' }}>
                #{tag}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Avatar
            src={post.profiles?.profile_image_url}
            sx={{ width: 20, height: 20, fontSize: '0.65rem' }}
          >
            {post.profiles?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="caption" color="text.secondary">{post.profiles?.username}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={session ? '' : '로그인이 필요합니다'}>
            <span>
              <IconButton size="small" onClick={handleLike} disabled={!session || likeLoading}>
                {isLiked
                  ? <FavoriteIcon sx={{ fontSize: 16, color: '#E74C3C' }} />
                  : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </span>
          </Tooltip>
          <Typography variant="caption">{post.likes_count}</Typography>
          <Tooltip title={session ? '' : '로그인이 필요합니다'}>
            <span>
              <IconButton size="small" onClick={handleBookmark} disabled={!session || bookmarkLoading}>
                {isBookmarked
                  ? <BookmarkIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  : <BookmarkBorderIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  )
}

export default PostCard
