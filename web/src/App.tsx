import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './presentation/components/AppShell'
import { ActivityPage } from './presentation/pages/ActivityPage'
import { HomePage } from './presentation/pages/HomePage'
import { LevelPage } from './presentation/pages/LevelPage'
import { NotFoundPage } from './presentation/pages/NotFoundPage'
import { OccupationPage } from './presentation/pages/OccupationPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="nivel/:levelId" element={<LevelPage />} />
          <Route path="nivel/:levelId/:occupationId" element={<OccupationPage />} />
          <Route
            path="nivel/:levelId/:occupationId/:activityId"
            element={<ActivityPage />}
          />
          <Route path="inicio" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
