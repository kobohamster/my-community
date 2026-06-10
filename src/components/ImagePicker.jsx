import { useState, useCallback } from 'react'
import {
  Box, Grid, Typography, Button, CircularProgress,
  Card, CardMedia, CardActionArea, Alert,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400',
  'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400',
  'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400',
  'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400',
  'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400',
  'https://images.unsplash.com/photo-1556907702-f7f59c329e12?w=400',
]

const ImagePicker = ({ selectedUrl, onSelect }) => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const fetchImages = useCallback(async (nextPage = 1) => {
    setLoading(true)
    setError('')
    if (!UNSPLASH_KEY) {
      setImages(FALLBACK_IMAGES.map((url, i) => ({ id: String(i), url })))
      setLoading(false)
      return
    }
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=chocolate&per_page=6&page=${nextPage}&client_id=${UNSPLASH_KEY}`
      )
      if (!res.ok) throw new Error('Unsplash API 오류')
      const data = await res.json()
      setImages(data.results.map((img) => ({ id: img.id, url: img.urls.small, full: img.urls.regular })))
      setPage(nextPage)
    } catch {
      setError('이미지를 불러올 수 없습니다. 기본 이미지를 사용합니다.')
      setImages(FALLBACK_IMAGES.map((url, i) => ({ id: String(i), url })))
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRefresh = () => fetchImages(page + 1)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          초콜릿 이미지 선택
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {images.length === 0 && (
            <Button size="small" startIcon={<SearchIcon />} onClick={() => fetchImages(1)} variant="outlined">
              이미지 검색
            </Button>
          )}
          {images.length > 0 && (
            <Button size="small" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loading}>
              새로고침
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 1.5, fontSize: '0.8rem' }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} color="primary" />
        </Box>
      ) : (
        <Grid container spacing={1}>
          {images.map((img) => (
            <Grid item xs={4} key={img.id}>
              <Card
                sx={{
                  border: selectedUrl === img.url ? '3px solid' : '2px solid transparent',
                  borderColor: selectedUrl === img.url ? 'primary.main' : 'transparent',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <CardActionArea onClick={() => onSelect(img.full ?? img.url)}>
                  <CardMedia component="img" image={img.url} alt="chocolate" sx={{ height: 80, objectFit: 'cover' }} />
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedUrl && (
        <Box sx={{ mt: 1.5, p: 1, bgcolor: 'background.default', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="img" src={selectedUrl} sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }} />
          <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1 }}>
            이미지 선택됨
          </Typography>
          <Button size="small" color="error" onClick={() => onSelect('')} sx={{ minWidth: 0, p: 0.5 }}>
            제거
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default ImagePicker
