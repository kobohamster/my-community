import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import PostListPage from './pages/PostListPage'
import PostDetailPage from './pages/PostDetailPage'
import PostWritePage from './pages/PostWritePage'
import MyPage from './pages/MyPage'

const basename = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '')

const App = () => (
  <BrowserRouter basename={basename}>
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/posts" element={<PostListPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/write" element={<ProtectedRoute><PostWritePage /></ProtectedRoute>} />
        <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default App
