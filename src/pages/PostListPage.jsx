import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Container, Box, Typography, Tabs, Tab, Grid,
  CircularProgress, Alert, TextField, InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import PostCard from '../components/PostCard'

const TYPE_TABS = [
  { label: '전체', value: 'all' },
  { label: '다크 (70~100%)', value: 'dark' },
  { label: '밀크 (30~70%)', value: 'milk' },
  { label: '화이트 (0~30%)', value: 'white' },
]

const PostListPage = () => {
  const { session } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const typeParam = searchParams.get('type') || 'all'
  const tabIndex = TYPE_TABS.findIndex((t) => t.value === typeParam) || 0

  const [posts, setPosts] = useState([])
  const [likedIds, setLikedIds] = useState(new Set())
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let query = supabase
        .from('chocorate_posts')
        .select('*, profiles!chocorate_posts_user_id_fkey(username, profile_image_url)')
        .order('created_at', { ascending: false })

      if (typeParam === 'dark') query = query.gte('cacao_percentage', 70)
      else if (typeParam === 'milk') query = query.gte('cacao_percentage', 30).lt('cacao_percentage', 70)
      else if (typeParam === 'white') query = query.lt('cacao_percentage', 30)

      const { data, error: err } = await query
      if (err) throw err
      setPosts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [typeParam])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  useEffect(() => {
    if (!session) { setLikedIds(new Set()); setBookmarkedIds(new Set()); return }
    Promise.all([
      supabase.from('chocorate_liked_posts').select('post_id').eq('user_id', session.user.id),
      supabase.from('chocorate_bookmarks').select('post_id').eq('user_id', session.user.id),
    ]).then(([liked, bookmarked]) => {
      setLikedIds(new Set((liked.data || []).map((r) => r.post_id)))
      setBookmarkedIds(new Set((bookmarked.data || []).map((r) => r.post_id)))
    })
  }, [session])

  const handleTabChange = (_, idx) => {
    setSearchParams(TYPE_TABS[idx].value === 'all' ? {} : { type: TYPE_TABS[idx].value })
  }

  const handleLikeChange = (postId, liked, newCount) => {
    setLikedIds((prev) => { const s = new Set(prev); liked ? s.add(postId) : s.delete(postId); return s })
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: newCount } : p))
  }

  const handleBookmarkChange = (postId, bookmarked) => {
    setBookmarkedIds((prev) => { const s = new Set(prev); bookmarked ? s.add(postId) : s.delete(postId); return s })
  }

  const filtered = search
    ? posts.filter((p) => p.title.includes(search) || p.caption.includes(search) || p.hashtags?.some((t) => t.includes(search)))
    : posts

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>초콜릿 리뷰</Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="제목, 내용, #해시태그 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 2 }}
      />

      <Tabs
        value={Math.max(0, tabIndex)}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {TYPE_TABS.map((t) => <Tab key={t.value} label={t.label} sx={{ fontSize: '0.8rem', minWidth: 0, px: 1.5 }} />)}
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body2" color="text.secondary">
            {search ? '검색 결과가 없습니다.' : '아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((post) => (
            <Grid item xs={6} key={post.id}>
              <PostCard
                post={post}
                isLiked={likedIds.has(post.id)}
                isBookmarked={bookmarkedIds.has(post.id)}
                onLikeChange={handleLikeChange}
                onBookmarkChange={handleBookmarkChange}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default PostListPage
