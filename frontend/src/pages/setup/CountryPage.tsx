import { Form, Input } from 'antd'
import CrudPage from '../../components/CrudPage'
import { countryApi } from '../../api'

export default function CountryPage() {
  return (
    <CrudPage
      title="Country"
      queryKey={['countries']}
      fetchFn={countryApi.getAll}
      saveFn={countryApi.saveOrUpdate as never}
      deleteFn={countryApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Code', dataIndex: 'code', key: 'code' },
      ]}
      formFields={
        <>
          <Form.Item name="name" label="Country Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Singapore" />
          </Form.Item>
          <Form.Item name="code" label="Country Code">
            <Input placeholder="e.g. SG" maxLength={3} />
          </Form.Item>
        </>
      }
    />
  )
}
