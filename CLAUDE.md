# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어 설정
모든 답변은 한국어로 작성한다.

## 개발 명령어

```bash
npm run dev      # 개발 서버 → http://localhost:5173
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
npm run preview  # 빌드 미리보기
```

## 아키텍처

**진입점 흐름**: `index.html` → `src/main.jsx` → `src/App.jsx`

- `src/main.jsx`: `ThemeProvider`와 `CssBaseline`이 앱 전체를 감싼다. 전역 스타일 설정은 여기서 한다.
- `src/theme.js`: MUI 테마 중앙 관리. 색상·폰트·간격을 바꿀 때 이 파일만 수정한다.
- `src/App.jsx`: 라우터와 레이아웃 최상위. 페이지를 추가할 때 여기에 `Route`를 추가한다.

## 권장 디렉토리 구조

새 파일을 만들 때 아래 구조를 따른다.

```
src/
├── components/   # 재사용 UI 컴포넌트
├── pages/        # 라우트별 페이지
├── hooks/        # 커스텀 훅
├── utils/        # 유틸리티 함수
├── constants/    # 상수
├── assets/       # 이미지 등 정적 파일
├── theme.js
├── main.jsx
└── App.jsx
```

## MUI 사용 규칙

- 레이아웃: `Box`, `Container`, `Grid`
- 스타일: inline `sx` prop 사용 (별도 CSS 파일 최소화)
- 색상·간격은 `theme.js`의 값을 `theme.palette.*`, `theme.spacing()`으로 참조

## 디자인·컨벤션 문서

- 디자인 기준: `@../../docs/design-system.md`
- 코드 규칙: `@../../docs/code-convention.md`
- 신규 프로젝트 가이드: `@../../docs/new_project.md`
