import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Avatar, Menu, MenuItem, Divider,
} from '@mui/material'
import EditNoteIcon from '@mui/icons-material/EditNote'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const navigate = useNavigate()
  const { session, profile, signOut } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleSignOut = async () => {
    handleMenuClose()
    await signOut()
    navigate('/')
  }

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'primary.main', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Toolbar sx={{ maxWidth: 520, width: '100%', mx: 'auto', px: 2 }}>
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{ fontWeight: 700, letterSpacing: 1, color: 'white', flexGrow: 1, textDecoration: 'none' }}
        >
          🍫 chocorate
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            component={RouterLink}
            to="/posts"
            color="inherit"
            size="small"
            sx={{ fontWeight: 400, opacity: 0.85 }}
          >
            리뷰
          </Button>

          {session ? (
            <>
              <IconButton
                onClick={() => navigate('/write')}
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, borderRadius: 2, px: 1.5 }}
                size="small"
              >
                <EditNoteIcon fontSize="small" />
                <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 500 }}>작성</Typography>
              </IconButton>
              <IconButton onClick={handleAvatarClick} size="small" sx={{ p: 0.5 }}>
                <Avatar
                  src={profile?.profile_image_url}
                  sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.8rem' }}
                >
                  {profile?.username?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem disabled sx={{ fontSize: '0.8rem', opacity: 0.6 }}>{profile?.username}</MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleMenuClose(); navigate('/mypage') }}>마이페이지</MenuItem>
                <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>로그아웃</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}
            >
              로그인
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
