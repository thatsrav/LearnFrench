import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import HomeDashboardPage from './pages/HomeDashboardPage.tsx'
import LeaderboardPage from './pages/LeaderboardPage.tsx'
import LessonPage from './pages/LessonPage.tsx'
import ReadingRoomPage from './pages/ReadingRoomPage.tsx'
import SpeakingCoachPage from './pages/SpeakingCoachPage.tsx'
import SyllabusPage from './pages/SyllabusPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomeDashboardPage /> },
      { path: 'syllabus', element: <SyllabusPage /> },
      { path: 'lesson/:unitId', element: <LessonPage /> },
      { path: 'reading', element: <ReadingRoomPage /> },
      { path: 'speaking', element: <SpeakingCoachPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
