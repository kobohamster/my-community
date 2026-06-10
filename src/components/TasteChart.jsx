import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { Box, Typography } from '@mui/material'

const TASTE_LABELS = {
  sweetness: '단맛',
  saltiness: '짠맛',
  sourness: '신맛',
  bitterness: '쓴맛',
  umami: '감칠맛',
}

const TasteChart = ({ data }) => {
  const chartData = Object.entries(TASTE_LABELS).map(([key, label]) => ({
    taste: label,
    value: data[key] ?? 3,
    fullMark: 5,
  }))

  const hasData = Object.keys(TASTE_LABELS).some((k) => data[k] != null)
  if (!hasData) return null

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} gutterBottom color="text.secondary">
        맛 프로필
      </Typography>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#E8DDD5" />
          <PolarAngleAxis dataKey="taste" tick={{ fontSize: 11, fill: '#6B4C3B' }} />
          <Radar
            dataKey="value"
            stroke="#402A1E"
            fill="#402A1E"
            fillOpacity={0.25}
            dot={{ fill: '#402A1E', r: 3 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default TasteChart
