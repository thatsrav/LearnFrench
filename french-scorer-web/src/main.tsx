import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'
import AppShell from './components/AppShell.tsx'
import RootLayout from './components/RootLayout.tsx'
import AIScorerPage from './pages/AIScorerPage.tsx'
import LandingPage from './pages/LandingPage.tsx'
import LeaderboardPage from './pages/LeaderboardPage.tsx'
import LessonPage from './pages/LessonPage.tsx'
import ReadingRoomPage from './pages/ReadingRoomPage.tsx'
import SpeakingCoachPage from './pages/SpeakingCoachPage.tsx'
import UnitOverviewPage from './pages/UnitOverviewPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        element: <AppShell />,
        children: [
          { path: 'scorer', element: <AIScorerPage /> },
          { path: 'unit/:moduleId', element: <UnitOverviewPage /> },
          { path: 'lesson/:unitId', element: <LessonPage /> },
          { path: 'reading', element: <ReadingRoomPage /> },
          { path: 'speaking', element: <SpeakingCoachPage /> },
          { path: 'leaderboard', element: <LeaderboardPage /> },
          { path: 'syllabus', element: <Navigate to="/#syllabus" replace /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
