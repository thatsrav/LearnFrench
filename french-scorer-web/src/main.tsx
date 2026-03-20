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
import TefOralLabsPage from './pages/TefOralLabsPage.tsx'
import AccountPage from './pages/AccountPage.tsx'
import AuthCallbackPage from './pages/AuthCallbackPage.tsx'
import SyllabusPage from './pages/SyllabusPage.tsx'
import DashboardHomePage from './pages/DashboardHomePage.tsx'
import GrammarAtelierPage from './pages/GrammarAtelierPage.tsx'
import ReadingRoomPage from './pages/ReadingRoomPage.tsx'
import WritingAreaPage from './pages/WritingAreaPage.tsx'
import { tefPrepSkillPath } from './lib/tefPrepNav'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '',
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardHomePage /> },
          { path: 'scorer', element: <AIScorerPage /> },
          { path: 'unit/:moduleId', element: <UnitOverviewPage /> },
          { path: 'lesson/:unitId', element: <LessonPage /> },
          { path: 'game', element: <GrammarAtelierPage /> },
          { path: 'reading-room', element: <ReadingRoomPage /> },
          { path: 'writing', element: <WritingAreaPage /> },
          { path: 'tef-prep/oral-labs', element: <TefOralLabsPage /> },
          { path: 'listening', element: <Navigate to="/tef-prep/oral-labs" replace /> },
          { path: 'speaking', element: <Navigate to="/tef-prep/oral-labs#speaking" replace /> },
          { path: 'reading', element: <Navigate to={tefPrepSkillPath('reading')} replace /> },
          { path: 'leaderboard', element: <LeaderboardPage /> },
          { path: 'tef-prep', element: <TefPrepHubPage /> },
          { path: 'tef-prep/a1/:unit', element: <TefPrepUnitPage /> },
          { path: 'tef-prep/a1/:unit/:skill', element: <TefPrepActivityPage /> },
          { path: 'syllabus', element: <SyllabusPage /> },
          { path: 'account', element: <AccountPage /> },
          { path: 'auth/callback', element: <AuthCallbackPage /> },
        ],
      },
      { path: 'welcome', element: <LandingPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
