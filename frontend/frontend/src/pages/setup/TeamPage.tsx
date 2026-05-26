import { Form, Input } from 'antd'
import CrudPage from '../../components/CrudPage'
import { teamApi } from '../../api'

export default function TeamPage() {
  return (
    <CrudPage
      title="Team"
      queryKey={['teams']}
      fetchFn={teamApi.getAll}
      saveFn={teamApi.saveOrUpdate as never}
      deleteFn={teamApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
        { title: 'Activity', dataIndex: 'activity', key: 'activity' },
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
      ]}
      formFields={
        <>
          <Form.Item name="name" label="Team Name" rules={[{ required: true }]}>
            <Input placeholder="Enter team name" />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input placeholder="Team code" />
          </Form.Item>
          <Form.Item name="activity" label="Activity">
            <Input placeholder="Main activity" />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={3} placeholder="Additional notes" />
          </Form.Item>
        </>
      }
    />
  )
}
