import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container, Box, Typography, Avatar, Button, Tabs, Tab,
  Grid, CircularProgress, Chip,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import PostCard from '../components/PostCard'

const MyPage = () => {
  const navigate = useNavigate()
  const { session, profile, signOut } = useAuth()
  const [tab, setTab] = useState(0)
  const [myPosts, setMyPosts] = useState([])
  const [bookmarkedPosts, setBookmarkedPosts] = useState([])
  const [likedIds, setLikedIds] = useState(new Set())
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!session) return
    setLoading(true)
    const [postsRes, bookmarksRes, likedRes] = await Promise.all([
      supabase.from('chocorate_posts')
        .select('*, profiles!chocorate_posts_user_id_fkey(username, profile_image_url)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false }),
      supabase.from('chocorate_bookmarks')
        .select('post_id, chocorate_posts(*, profiles!chocorate_posts_user_id_fkey(username, profile_image_url))')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false }),
      supabase.from('chocorate_liked_posts')
        .select('post_id')
        .eq('user_id', session.user.id),
    ])
    setMyPosts(postsRes.data || [])
    setBookmarkedPosts((bookmarksRes.data || []).map((b) => b.chocorate_posts).filter(Boolean))
    setBookmarkedIds(new Set((bookmarksRes.data || []).map((b) => b.post_id)))
    setLikedIds(new Set((likedRes.data || []).map((r) => r.post_id)))
    setLoading(false)
  }, [session])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleLikeChange = (postId, liked, newCount) => {
    setLikedIds((prev) => { const s = new Set(prev); liked ? s.add(postId) : s.delete(postId); return s })
    setMyPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: newCount } : p))
    setBookmarkedPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: newCount } : p))
  }

  const handleBookmarkChange = (postId, bookmarked) => {
    setBookmarkedIds((prev) => { const s = new Set(prev); bookmarked ? s.add(postId) : s.delete(postId); return s })
    if (!bookmarked) setBookmarkedPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  const displayPosts = tab === 0 ? myPosts : bookmarkedPosts

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      {/* 프로필 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2.5, bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 6px rgba(64,42,30,0.07)' }}>
        <Avatar
          src={profile?.profile_image_url}
          sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}
        >
          {profile?.username?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700}>{profile?.username}</Typography>
          <Typography variant="body2" color="text.secondary">{session?.user?.email}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Chip label={`리뷰 ${myPosts.length}`} size="small" variant="outlined" />
            <Chip label={`북마크 ${bookmarkedPosts.length}`} size="small" variant="outlined" />
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleSignOut}
          size="small"
          color="error"
        >
          로그아웃
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="내 리뷰" />
        <Tab label="북마크" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : displayPosts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body2" color="text.secondary">
            {tab === 0 ? '아직 작성한 리뷰가 없습니다.' : '북마크한 리뷰가 없습니다.'}
          </Typography>
          {tab === 0 && (
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/write')}>
              첫 리뷰 작성하기
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {displayPosts.map((post) => (
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

export default MyPage
