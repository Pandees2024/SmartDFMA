import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout, Menu, Avatar, Dropdown, Badge, Typography, Breadcrumb,
  Button, Tooltip,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined, SettingOutlined, UserOutlined, LogoutOutlined,
  BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ProjectOutlined,
  ApartmentOutlined, TeamOutlined, ContainerOutlined, ToolOutlined,
  DatabaseOutlined, CheckSquareOutlined, CarOutlined, SearchOutlined,
  TableOutlined, AppstoreOutlined, GlobalOutlined, BlockOutlined,
  BarChartOutlined, SafetyOutlined, DeploymentUnitOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../store/auth.store'

const { Header, Sider, Content } = Layout
const { Text } = Typography

type MenuItem = Required<MenuProps>['items'][number]

const menuItems: MenuItem[] = [
  {
    key: '/Admin/Dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'ppvc-workflow',
    icon: <AppstoreOutlined />,
    label: 'PPVC Workflow',
    children: [
      { key: '/Admin/PlanningModule', icon: <BarChartOutlined />, label: 'Planning (Gantt)' },
      { key: '/Admin/PrecastActivity', icon: <DeploymentUnitOutlined />, label: 'Pre-Cast Activity' },
      { key: '/Admin/QCCheckList', icon: <SafetyOutlined />, label: 'QC Checklist' },
      { key: '/Admin/Delivery', icon: <CarOutlined />, label: 'Delivery' },
      { key: '/Admin/AssertTracking', icon: <SearchOutlined />, label: 'Asset Tracking' },
    ],
  },
  {
    key: '/Admin/Ppvctransaction',
    icon: <TableOutlined />,
    label: 'PPVC Transactions',
  },
  {
    key: 'setup',
    icon: <SettingOutlined />,
    label: 'Setup',
    children: [
      { key: '/Admin/Project', icon: <ProjectOutlined />, label: 'Projects' },
      { key: '/Admin/Module', icon: <ApartmentOutlined />, label: 'Modules' },
      { key: '/Admin/Component', icon: <ContainerOutlined />, label: 'Components' },
      { key: '/Admin/Activity', icon: <CheckSquareOutlined />, label: 'Activities' },
      { key: '/Admin/Team', icon: <TeamOutlined />, label: 'Teams' },
      { key: '/Admin/Material', icon: <DatabaseOutlined />, label: 'Materials' },
      { key: '/Admin/Unit', icon: <ToolOutlined />, label: 'Units' },
      { key: '/Admin/Block', icon: <BlockOutlined />, label: 'Blocks' },
      { key: '/Admin/CountryList', icon: <GlobalOutlined />, label: 'Countries' },
    ],
  },
  {
    key: 'admin',
    icon: <UserOutlined />,
    label: 'Administration',
    children: [
      { key: '/Admin/UserList', icon: <UserOutlined />, label: 'Users' },
    ],
  },
]

const PAGE_TITLES: Record<string, string[]> = {
  '/Admin/Dashboard': ['Dashboard'],
  '/Admin/Ppvctransaction': ['PPVC', 'Transactions'],
  '/Admin/PlanningModule': ['PPVC', 'Planning Module'],
  '/Admin/PrecastActivity': ['PPVC', 'Pre-Cast Activity'],
  '/Admin/QCCheckList': ['PPVC', 'QC Checklist'],
  '/Admin/Delivery': ['PPVC', 'Delivery'],
  '/Admin/AssertTracking': ['PPVC', 'Asset Tracking'],
  '/Admin/Project': ['Setup', 'Projects'],
  '/Admin/Module': ['Setup', 'Modules'],
  '/Admin/Activity': ['Setup', 'Activities'],
  '/Admin/Team': ['Setup', 'Teams'],
  '/Admin/Material': ['Setup', 'Materials'],
  '/Admin/Component': ['Setup', 'Components'],
  '/Admin/Unit': ['Setup', 'Units'],
  '/Admin/Block': ['Setup', 'Blocks'],
  '/Admin/CountryList': ['Setup', 'Countries'],
  '/Admin/UserList': ['Admin', 'Users'],
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, clearAuth } = useAuthStore()

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) navigate(key)
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.name || user?.Name || user?.username || 'Profile',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ]

  const breadcrumbs = PAGE_TITLES[location.pathname] || ['Page']

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: 'linear-gradient(180deg, #001529 0%, #002244 100%)',
          boxShadow: '2px 0 12px rgba(0,0,0,0.2)',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div className="ppvc-sidebar-logo">
          {collapsed ? (
            <DeploymentUnitOutlined className="ppvc-sidebar-logo-icon" />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <DeploymentUnitOutlined className="ppvc-sidebar-logo-icon" />
              <span className="ppvc-sidebar-logo-text">PPVC Platform</span>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['ppvc-workflow', 'setup']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: 8,
          }}
        />
      </Sider>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.3s' }}>
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: 64,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, color: '#1a6fb0' }}
            />
            <Breadcrumb
              items={[
                { title: 'PPVC Platform' },
                ...breadcrumbs.map(b => ({ title: b })),
              ]}
              style={{ fontSize: 14 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Tooltip title="Notifications">
              <Badge count={0} showZero={false}>
                <Button type="text" icon={<BellOutlined />} style={{ fontSize: 18 }} />
              </Badge>
            </Tooltip>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 8,
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Avatar
                  size="small"
                  style={{ background: '#1a6fb0', fontWeight: 700 }}
                >
                  {(user?.username || 'U')[0].toUpperCase()}
                </Avatar>
                <Text style={{ fontWeight: 500, fontSize: 14 }}>
                  {user?.name || user?.Name || user?.username}
                </Text>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* ── Page Content ─────────────────────────────────────────────────────── */}
        <Content
          style={{
            padding: 24,
            minHeight: 'calc(100vh - 64px)',
            background: '#f0f5ff',
          }}
          className="ppvc-fade-in"
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
