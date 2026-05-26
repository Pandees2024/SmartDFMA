import { Form, Input, Select } from 'antd'
import { useQuery } from '@tanstack/react-query'
import CrudPage from '../../components/CrudPage'
import { moduleApi, unitApi } from '../../api'

export default function ModulePage() {
  const { data: units = [] } = useQuery({ queryKey: ['units'], queryFn: unitApi.getAll })

  return (
    <CrudPage
      title="Module"
      queryKey={['modules']}
      fetchFn={moduleApi.getAll}
      saveFn={moduleApi.saveOrUpdate as never}
      deleteFn={moduleApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
        { title: 'Type', dataIndex: 'module_type', key: 'module_type' },
        {
          title: 'Unit', key: 'unit',
          render: (_: unknown, r: Record<string, unknown>) => {
            const unit = units.find(u => u.id === r.unit_id)
            return unit?.name || '-'
          },
        },
      ]}
      formFields={
        <>
          <Form.Item name="name" label="Module Name" rules={[{ required: true }]}>
            <Input placeholder="Enter module name" />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input placeholder="Module code" />
          </Form.Item>
          <Form.Item name="module_type" label="Module Type">
            <Input placeholder="e.g. Residential, Commercial" />
          </Form.Item>
          <Form.Item name="unit_id" label="Unit">
            <Select placeholder="Select unit" allowClear>
              {units.map(u => <Select.Option key={u.id} value={u.id}>{u.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="short_description" label="Short Description">
            <Input placeholder="Short description" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Detailed description" />
          </Form.Item>
        </>
      }
    />
  )
}
