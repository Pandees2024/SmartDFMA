import { Form, Input } from 'antd'
import CrudPage from '../../components/CrudPage'
import { unitApi } from '../../api'

export default function UnitPage() {
  return (
    <CrudPage
      title="Unit"
      queryKey={['units']}
      fetchFn={unitApi.getAll}
      saveFn={unitApi.saveOrUpdate as never}
      deleteFn={unitApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Code', dataIndex: 'code', key: 'code' },
      ]}
      formFields={
        <>
          <Form.Item name="name" label="Unit Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Unit A" />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input placeholder="Unit code" />
          </Form.Item>
        </>
      }
    />
  )
}
