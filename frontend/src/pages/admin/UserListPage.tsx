import { Form, Input, Select } from 'antd'
import { useQuery } from '@tanstack/react-query'
import CrudPage from '../../components/CrudPage'
import { userApi, teamApi } from '../../api'

export default function UserListPage() {
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: teamApi.getAll })

  return (
    <CrudPage
      title="User"
      queryKey={['users']}
      fetchFn={userApi.getAll}
      saveFn={userApi.saveOrUpdate as never}
      deleteFn={userApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Username', dataIndex: 'username', key: 'username' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Role', dataIndex: 'role', key: 'role' },
        {
          title: 'Team', key: 'team',
          render: (_: unknown, r: Record<string, unknown>) => {
            const team = teams.find(t => t.id === r.team_id)
            return team?.name || '-'
          },
        },
      ]}
      formFields={
        <>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input placeholder="Login username" />
          </Form.Item>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="Full name" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" placeholder="Email address" />
          </Form.Item>
          <Form.Item name="password" label="Password">
            <Input.Password placeholder="Leave blank to keep current password" />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select placeholder="Select role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
              <Select.Option value="engineer">Engineer</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="team_id" label="Team">
            <Select placeholder="Select team" allowClear>
              {teams.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="landing_page" label="Landing Page">
            <Input placeholder="/Admin/Dashboard" />
          </Form.Item>
        </>
      }
    />
  )
}
