import { Form, Input, Select } from 'antd'
import { useQuery } from '@tanstack/react-query'
import CrudPage from '../../components/CrudPage'
import { activityApi } from '../../api'

export default function ActivityPage() {
  const { data: activities = [] } = useQuery({ queryKey: ['activities'], queryFn: activityApi.getAll })

  return (
    <CrudPage
      title="Activity"
      queryKey={['activities']}
      fetchFn={activityApi.getAll}
      saveFn={activityApi.saveOrUpdate as never}
      deleteFn={activityApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
        {
          title: 'Parent Activity', key: 'parent',
          render: (_: unknown, r: Record<string, unknown>) => {
            const parent = activities.find(a => a.id === r.parent_activity_id)
            return parent?.name || (r.parent_activity_id ? `ID: ${r.parent_activity_id}` : '-')
          },
        },
      ]}
      formFields={
        <>
          <Form.Item name="name" label="Activity Name" rules={[{ required: true }]}>
            <Input placeholder="Enter activity name" />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input placeholder="Activity code" />
          </Form.Item>
          <Form.Item name="parent_activity_id" label="Parent Activity">
            <Select placeholder="Select parent activity (optional)" allowClear>
              {activities
                .filter(a => !a.parent_activity_id)
                .map(a => <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </>
      }
    />
  )
}
