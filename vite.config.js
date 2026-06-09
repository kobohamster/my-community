import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 배포 시 저장소명이 base가 됨
  // 예: kobohamster.github.io/my-community → base: '/my-community/'
  base: process.env.GITHUB_ACTIONS ? '/my-community/' : '/',
})
