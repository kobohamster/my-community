import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress,
  Alert, IconButton, Tabs, Tab
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { supabase } from '../supabase'

const statusChip = (status) => {
  const map = {
    pending: { label: '대기', color: 'warning' },
    approved: { label: '승인', color: 'success' },
    rejected: { label: '거절', color: 'error' },
  }
  const s = map[status] || { label: status, color: 'default' }
  return <Chip label={s.label} color={s.color} size="small" />
}

const AdminPage = ({ session }) => {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [tab, setTab] = useState(0)

  const fetchProfiles = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', false)
      .order('created_at', { ascending: false })
    setProfiles(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const handleApprove = async (id, name) => {
    await supabase.from('profiles').update({ status: 'approved' }).eq('id', id)
    setMessage(`${name}님을 승인했습니다.`)
    fetchProfiles()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleReject = async (id, name) => {
    await supabase.from('profiles').update({ status: 'rejected' }).eq('id', id)
    setMessage(`${name}님을 거절했습니다.`)
    fetchProfiles()
    setTimeout(() => setMessage(''), 3000)
  }

  const tabProfiles = [
    profiles.filter((p) => p.status === 'pending'),
    profiles.filter((p) => p.status === 'approved'),
    profiles.filter((p) => p.status === 'rejected'),
  ]
  const tabLabels = ['대기 중', '승인됨', '거절됨']

  return (
    <Box sx={{ minHeight: '100vh', background: '#0a0d1a' }}>
      {/* 헤더 */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(232,200,74,0.12)',
          background: 'rgba(10,13,26,0.95)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography
              sx={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '0.9rem',
                color: '#e8c84a',
                textShadow: '0 0 10px rgba(232,200,74,0.4)',
              }}
            >
              UNTIL DAWN
            </Typography>
            <Chip label="관리자" size="small" sx={{ background: 'rgba(232,200,74,0.1)', color: '#e8c84a', border: '1px solid rgba(232,200,74,0.3)' }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h2" sx={{ mb: 4 }}>회원 관리</Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 3,
            '& .MuiTab-root': { color: 'text.secondary', fontSize: '0.85rem' },
            '& .Mui-selected': { color: '#e8c84a' },
            '& .MuiTabs-indicator': { backgroundColor: '#e8c84a' },
          }}
        >
          {tabLabels.map((label, i) => (
            <Tab
              key={label}
              label={`${label} (${tabProfiles[i].length})`}
            />
          ))}
        </Tabs>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#e8c84a' }} />
          </Box>
        ) : tabProfiles[tab].length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ color: 'text.disabled' }}>해당 회원이 없습니다.</Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              background: '#111428',
              border: '1px solid rgba(232,200,74,0.1)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {['이름', '아이디', '생년월일', '가입일', '가입 목적', '상태', '작업'].map((h) => (
                    <TableCell
                      key={h}
                      sx={{ color: 'text.secondary', fontSize: '0.8rem', borderColor: 'rgba(232,200,74,0.08)' }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tabProfiles[tab].map((p) => (
                  <TableRow
                    key={p.id}
                    sx={{ '&:hover': { background: 'rgba(232,200,74,0.03)' } }}
                  >
                    <TableCell sx={{ color: 'text.primary', borderColor: 'rgba(232,200,74,0.06)', fontWeight: 600 }}>
                      {p.name}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(232,200,74,0.06)', fontFamily: 'monospace' }}>
                      {p.username}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(232,200,74,0.06)' }}>
                      {p.birthday}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(232,200,74,0.06)', fontSize: '0.8rem' }}>
                      {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: 'text.secondary',
                        borderColor: 'rgba(232,200,74,0.06)',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.8rem',
                      }}
                    >
                      {p.purpose}
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(232,200,74,0.06)' }}>
                      {statusChip(p.status)}
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(232,200,74,0.06)' }}>
                      {p.status === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(p.id, p.name)}
                            sx={{ color: '#5a9e72' }}
                            title="승인"
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleReject(p.id, p.name)}
                            sx={{ color: '#cf6679' }}
                            title="거절"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                      {p.status === 'approved' && (
                        <Button
                          size="small"
                          onClick={() => handleReject(p.id, p.name)}
                          sx={{ color: '#cf6679', fontSize: '0.7rem', minWidth: 0 }}
                        >
                          거절로 변경
                        </Button>
                      )}
                      {p.status === 'rejected' && (
                        <Button
                          size="small"
                          onClick={() => handleApprove(p.id, p.name)}
                          sx={{ color: '#5a9e72', fontSize: '0.7rem', minWidth: 0 }}
                        >
                          승인으로 변경
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  )
}

export default AdminPage
