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
import UnitOverviewPage from './pages/UnitOverviewPage.tsx'
import TefPrepHubPage from './pages/TefPrepHubPage.tsx'
import TefPrepUnitPage from './pages/TefPrepUnitPage.tsx'
import TefPrepActivityPage from './pages/TefPrepActivityPage.tsx'
import AccountPage from './pages/AccountPage.tsx'
import AuthCallbackPage from './pages/AuthCallbackPage.tsx'
import SyllabusPage from './pages/SyllabusPage.tsx'

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
          { path: 'reading', element: <Navigate to="/tef-prep" replace /> },
          { path: 'speaking', element: <Navigate to="/tef-prep" replace /> },
          { path: 'leaderboard', element: <LeaderboardPage /> },
          { path: 'tef-prep', element: <TefPrepHubPage /> },
          { path: 'tef-prep/a1/:unit', element: <TefPrepUnitPage /> },
          { path: 'tef-prep/a1/:unit/:skill', element: <TefPrepActivityPage /> },
          { path: 'syllabus', element: <SyllabusPage /> },
          { path: 'account', element: <AccountPage /> },
          { path: 'auth/callback', element: <AuthCallbackPage /> },
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
