import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

const ppvcTheme = {
  token: {
    colorPrimary: '#1a6fb0',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#13c2c2',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    colorBgBase: '#f0f5ff',
    colorBgContainer: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    boxShadowSecondary: '0 4px 24px rgba(0,0,0,0.16)',
  },
  components: {
    Layout: {
      siderBg: '#001529',
      headerBg: '#fff',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: '#1a6fb0',
      darkItemHoverBg: 'rgba(26, 111, 176, 0.3)',
      darkSubMenuItemBg: 'rgba(0,0,0,0.2)',
    },
    Button: {
      borderRadius: 8,
    },
    Table: {
      headerBg: '#1a6fb0',
      headerColor: '#fff',
      rowHoverBg: '#e8f4fd',
      borderRadius: 12,
      borderRadiusOuter: 12,
    },
    Card: {
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={ppvcTheme}>
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
