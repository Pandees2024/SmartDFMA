import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, DeploymentUnitOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api'
import { useAuthStore } from '../../store/auth.store'

const { Title, Text } = Typography

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const [form] = Form.useForm()

  const loginMutation = useMutation({
    mutationFn: (values: { Username: string; Password: string }) => authApi.login(values),
    onSuccess: (data: { Type?: string; AdditionalData?: { User: { Token?: string; api_token?: string; landing_page?: string } } }) => {
      if (data?.Type === 'S' && data?.AdditionalData?.User) {
        const user = data.AdditionalData.User as { Token?: string; api_token?: string; landing_page?: string } & Record<string, unknown>
        const token = user.Token || user.api_token || ''
        setAuth(user as never, token)
        message.success('Login successful! Welcome to PPVC Platform')
        navigate(user.landing_page || '/Admin/Dashboard')
      } else {
        message.error('Invalid username or password')
      }
    },
    onError: () => {
      message.error('Login failed. Please check your credentials.')
    },
  })

  return (
    <div className="ppvc-login-wrapper">
      <div className="ppvc-login-card">
        <div className="ppvc-login-logo">
          <div className="ppvc-login-logo-icon">
            <DeploymentUnitOutlined style={{ fontSize: 36, color: '#fff' }} />
          </div>
          <div className="ppvc-login-title">PPVC Platform</div>
          <div className="ppvc-login-subtitle">Precision Pre-fabricated Volumetric Construction</div>
        </div>

        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={values => loginMutation.mutate(values)}
          initialValues={{ Username: 'admin', Password: 'admin123' }}
        >
          <Form.Item
            name="Username"
            label={<span style={{ fontWeight: 600 }}>Username</span>}
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              id="login-username"
              prefix={<UserOutlined style={{ color: '#1a6fb0' }} />}
              placeholder="Enter username"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="Password"
            label={<span style={{ fontWeight: 600 }}>Password</span>}
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              id="login-password"
              prefix={<LockOutlined style={{ color: '#1a6fb0' }} />}
              placeholder="Enter password"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              id="login-submit"
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loginMutation.isPending}
              style={{
                height: 48,
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1a6fb0, #0f4c7d)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(26, 111, 176, 0.4)',
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Default: admin / admin123
          </Text>
        </div>
      </div>
    </div>
  )
}
