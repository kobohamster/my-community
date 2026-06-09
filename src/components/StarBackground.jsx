import { Box } from '@mui/material'
import { keyframes } from '@mui/system'

const twinkle = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.7); }
`

// 황금각(137.5°) 분포로 별 위치 자연스럽게 배치
const STARS = Array.from({ length: 20 }, (_, i) => {
  const angle = i * 137.508 * (Math.PI / 180)
  return {
    id: i,
    top: `${(Math.sin(angle) * 44 + 50).toFixed(1)}%`,
    left: `${(Math.cos(angle) * 47 + 50).toFixed(1)}%`,
    size: 1.8 + (i % 5) * 0.5,          // 1.8 ~ 3.8px
    delay: `${(i * 0.41) % 5}s`,
    duration: `${2.4 + (i % 7) * 0.35}s`,
  }
})

const StarBackground = () => (
  <Box
    aria-hidden="true"
    sx={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}
  >
    {STARS.map((star) => (
      <Box
        key={star.id}
        sx={{
          position: 'absolute',
          top: star.top,
          left: star.left,
          width: star.size,
          height: star.size,
          borderRadius: '50%',
          background: 'rgba(200, 228, 255, 0.95)',
          boxShadow: `0 0 ${star.size * 2}px ${star.size}px rgba(120, 190, 255, 0.7),
                      0 0 ${star.size * 5}px ${star.size * 2}px rgba(58, 123, 213, 0.35)`,
          animation: `${twinkle} ${star.duration} ease-in-out ${star.delay} infinite`,
        }}
      />
    ))}
  </Box>
)

export default StarBackground
