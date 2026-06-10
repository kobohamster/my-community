import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container, Box, Typography, TextField, Button,
  Rating, Slider, Chip, Alert, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import ImagePicker from '../components/ImagePicker'

const TASTE_LABELS = { sweetness: '단맛', saltiness: '짠맛', sourness: '신맛', bitterness: '쓴맛', umami: '감칠맛' }

const PostWritePage = () => {
  const navigate = useNavigate()
  const { session, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    caption: '',
    imageUrl: '',
    rating: 0,
    cacaoPct: 50,
    hashtagInput: '',
    hashtags: [],
    sweetness: 3,
    saltiness: 3,
    sourness: 3,
    bitterness: 3,
    umami: 3,
  })

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleHashtagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = form.hashtagInput.trim().replace(/^#/, '')
      if (tag && !form.hashtags.includes(tag) && form.hashtags.length < 10) {
        setForm((prev) => ({ ...prev, hashtags: [...prev.hashtags, tag], hashtagInput: '' }))
      }
    }
  }

  const removeHashtag = (tag) => setForm((prev) => ({ ...prev, hashtags: prev.hashtags.filter((t) => t !== tag) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('제목을 입력해주세요.'); return }
    if (!form.caption.trim()) { setError('내용을 입력해주세요.'); return }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.from('chocorate_posts').insert({
        user_id: session.user.id,
        title: form.title.trim(),
        caption: form.caption.trim(),
        image_url: form.imageUrl || null,
        rating: form.rating || null,
        cacao_percentage: form.cacaoPct,
        hashtags: form.hashtags,
        sweetness: form.sweetness,
        saltiness: form.saltiness,
        sourness: form.sourness,
        bitterness: form.bitterness,
        umami: form.umami,
      })
      if (err) throw err
      navigate('/posts')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cacaoLabel = form.cacaoPct >= 70 ? '다크' : form.cacaoPct >= 30 ? '밀크' : '화이트'

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>초콜릿 리뷰 작성</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* 기본 정보 */}
        <TextField
          label="제목 *"
          value={form.title}
          onChange={handleChange('title')}
          fullWidth
          size="small"
          inputProps={{ maxLength: 60 }}
          placeholder="초콜릿 이름이나 리뷰 제목을 입력하세요"
        />

        <TextField
          label="리뷰 내용 *"
          value={form.caption}
          onChange={handleChange('caption')}
          fullWidth
          multiline
          minRows={4}
          size="small"
          placeholder="초콜릿을 먹어본 솔직한 감상을 적어주세요"
        />

        {/* 별점 */}
        <Box>
          <Typography variant="body2" fontWeight={500} gutterBottom>별점</Typography>
          <Rating
            value={form.rating}
            onChange={(_, val) => setForm((prev) => ({ ...prev, rating: val }))}
            size="large"
          />
        </Box>

        {/* 카카오 함량 */}
        <Box>
          <Typography variant="body2" fontWeight={500} gutterBottom>
            카카오 함량: <strong>{form.cacaoPct}%</strong>
            <Chip label={cacaoLabel} size="small" sx={{ ml: 1, fontSize: '0.7rem' }} color="primary" />
          </Typography>
          <Slider
            value={form.cacaoPct}
            onChange={(_, val) => setForm((prev) => ({ ...prev, cacaoPct: val }))}
            min={0}
            max={100}
            marks={[{ value: 30, label: '30%' }, { value: 70, label: '70%' }]}
            valueLabelDisplay="auto"
            color="primary"
          />
        </Box>

        {/* 해시태그 */}
        <Box>
          <TextField
            label="해시태그 (Enter로 추가)"
            value={form.hashtagInput}
            onChange={handleChange('hashtagInput')}
            onKeyDown={handleHashtagKeyDown}
            fullWidth
            size="small"
            placeholder="#다크초콜릿 #발로나"
          />
          {form.hashtags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {form.hashtags.map((tag) => (
                <Chip key={tag} label={`#${tag}`} size="small" onDelete={() => removeHashtag(tag)} color="secondary" />
              ))}
            </Box>
          )}
        </Box>

        {/* 이미지 선택 */}
        <Box>
          <Typography variant="body2" fontWeight={500} gutterBottom>이미지</Typography>
          <ImagePicker selectedUrl={form.imageUrl} onSelect={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))} />
        </Box>

        {/* 맛 프로필 (선택) */}
        <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={500}>맛 프로필 (선택사항)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              1 = 매우 약함 · 5 = 매우 강함
            </Typography>
            {Object.entries(TASTE_LABELS).map(([key, label]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Typography variant="body2" sx={{ width: 52, flexShrink: 0 }}>{label}</Typography>
                <Slider
                  value={form[key]}
                  onChange={(_, val) => setForm((prev) => ({ ...prev, [key]: val }))}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  color="primary"
                  sx={{ flex: 1 }}
                />
                <Typography variant="caption" sx={{ width: 16 }}>{form[key]}</Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : '리뷰 등록하기'}
        </Button>
      </Box>
    </Container>
  )
}

export default PostWritePage
