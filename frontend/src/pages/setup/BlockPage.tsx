import { Form, Input } from 'antd'
import CrudPage from '../../components/CrudPage'
import { blockApi } from '../../api'

export default function BlockPage() {
  return (
    <CrudPage
      title="Block"
      queryKey={['blocks']}
      fetchFn={blockApi.getAll}
      saveFn={blockApi.saveOrUpdate as never}
      deleteFn={blockApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Code', dataIndex: 'code', key: 'code' },
      ]}
      formFields={
        <>
          <Form.Item name="name" label="Block Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Block A" />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input placeholder="Block code" />
          </Form.Item>
        </>
      }
    />
  )
}
