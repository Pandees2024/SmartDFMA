import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Spin } from 'antd'
import { useAuthStore } from './store/auth.store'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Lazy load all pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const PpvcTransactionPage = lazy(() => import('./pages/ppvc/PpvcTransactionPage'))
const PlanningModulePage = lazy(() => import('./pages/ppvc/PlanningModulePage'))
const PrecastActivityPage = lazy(() => import('./pages/ppvc/PrecastActivityPage'))
const QcChecklistPage = lazy(() => import('./pages/ppvc/QcChecklistPage'))
const DeliveryPage = lazy(() => import('./pages/ppvc/DeliveryPage'))
const AssetTrackingPage = lazy(() => import('./pages/ppvc/AssetTrackingPage'))
const ProjectPage = lazy(() => import('./pages/setup/ProjectPage'))
const ModulePage = lazy(() => import('./pages/setup/ModulePage'))
const ActivityPage = lazy(() => import('./pages/setup/ActivityPage'))
const TeamPage = lazy(() => import('./pages/setup/TeamPage'))
const MaterialPage = lazy(() => import('./pages/setup/MaterialPage'))
const ComponentPage = lazy(() => import('./pages/setup/ComponentPage'))
const UnitPage = lazy(() => import('./pages/setup/UnitPage'))
const BlockPage = lazy(() => import('./pages/setup/BlockPage'))
const CountryPage = lazy(() => import('./pages/setup/CountryPage'))
const UserListPage = lazy(() => import('./pages/admin/UserListPage'))

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" tip="Loading..." />
  </div>
)

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/Admin/Dashboard" replace />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={
              <PublicRoute><LoginPage /></PublicRoute>
            } />
            <Route path="/Login" element={
              <PublicRoute><LoginPage /></PublicRoute>
            } />
          </Route>

          {/* Protected routes */}
          <Route element={
            <ProtectedRoute><MainLayout /></ProtectedRoute>
          }>
            <Route path="/Admin/Dashboard" element={<DashboardPage />} />
            <Route path="/Admin/Ppvctransaction" element={<PpvcTransactionPage />} />
            <Route path="/Admin/PlanningModule" element={<PlanningModulePage />} />
            <Route path="/Admin/PrecastActivity" element={<PrecastActivityPage />} />
            <Route path="/Admin/QCCheckList" element={<QcChecklistPage />} />
            <Route path="/Admin/Delivery" element={<DeliveryPage />} />
            <Route path="/Admin/AssertTracking" element={<AssetTrackingPage />} />
            <Route path="/Admin/Project" element={<ProjectPage />} />
            <Route path="/Admin/Module" element={<ModulePage />} />
            <Route path="/Admin/Activity" element={<ActivityPage />} />
            <Route path="/Admin/Team" element={<TeamPage />} />
            <Route path="/Admin/Material" element={<MaterialPage />} />
            <Route path="/Admin/Component" element={<ComponentPage />} />
            <Route path="/Admin/Unit" element={<UnitPage />} />
            <Route path="/Admin/Block" element={<BlockPage />} />
            <Route path="/Admin/CountryList" element={<CountryPage />} />
            <Route path="/Admin/UserList" element={<UserListPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/Admin/Dashboard" replace />} />
          <Route path="*" element={<Navigate to="/Admin/Dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
