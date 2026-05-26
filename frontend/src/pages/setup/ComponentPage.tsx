import { Form, Input, Select } from 'antd'
import { useQuery } from '@tanstack/react-query'
import CrudPage from '../../components/CrudPage'
import { componentApi, moduleApi, materialApi } from '../../api'

export default function ComponentPage() {
  const { data: modules = [] } = useQuery({ queryKey: ['modules'], queryFn: moduleApi.getAll })
  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: materialApi.getAll })

  return (
    <CrudPage
      title="Component"
      queryKey={['components']}
      fetchFn={componentApi.getAll}
      saveFn={componentApi.saveOrUpdate as never}
      deleteFn={componentApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
        {
          title: 'Module', key: 'module',
          render: (_: unknown, r: Record<string, unknown>) => {
            const mod = modules.find(m => m.id === r.module_id)
            return mod?.name || '-'
          },
        },
        {
          title: 'Material', key: 'material',
          render: (_: unknown, r: Record<string, unknown>) => {
            const mat = materials.find(m => m.id === r.material_id)
            return mat?.name || '-'
          },
        },
        { title: 'RFID', dataIndex: 'rfid', key: 'rfid' },
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', ellipsis: true },
      ]}
      formFields={
        <>
          <Form.Item name="name" label="Component Name" rules={[{ required: true }]}>
            <Input placeholder="Enter component name" />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input placeholder="Component code / ID" />
          </Form.Item>
          <Form.Item name="module_id" label="Module">
            <Select placeholder="Select module" allowClear showSearch optionFilterProp="children">
              {modules.map(m => <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="material_id" label="Material">
            <Select placeholder="Select material" allowClear>
              {materials.map(m => <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="rfid" label="RFID Tag">
            <Input placeholder="RFID tag value" />
          </Form.Item>
          <Form.Item name="dimension" label="Dimension">
            <Input placeholder="Component dimensions" />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={2} placeholder="Additional notes" />
          </Form.Item>
        </>
      }
    />
  )
}
