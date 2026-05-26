import { Form, Input } from 'antd'
import CrudPage from '../../components/CrudPage'
import { materialApi } from '../../api'

export default function MaterialPage() {
  return (
    <CrudPage
      title="Material"
      queryKey={['materials']}
      fetchFn={materialApi.getAll}
      saveFn={materialApi.saveOrUpdate as never}
      deleteFn={materialApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Code', dataIndex: 'code', key: 'code' },
      ]}
      formFields={
        <>
          <Form.Item name="name" label="Material Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Concrete Grade 40" />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input placeholder="Material code" />
          </Form.Item>
        </>
      }
    />
  )
}
