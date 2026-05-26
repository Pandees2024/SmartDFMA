import { Form, Input, DatePicker } from 'antd'
import { useQuery } from '@tanstack/react-query'
import CrudPage from '../../components/CrudPage'
import { projectApi } from '../../api'
import dayjs from 'dayjs'

export default function ProjectPage() {
  return (
    <CrudPage
      title="Project"
      queryKey={['projects']}
      fetchFn={projectApi.getAll}
      saveFn={projectApi.saveOrUpdate as never}
      deleteFn={projectApi.delete}
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => String(a.name).localeCompare(String(b.name)) },
        { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
        { title: 'Client', dataIndex: 'client_name', key: 'client_name' },
        { title: 'Location', dataIndex: 'location', key: 'location' },
      ]}
      formFields={
        <>
          <Form.Item name="name" label="Project Name" rules={[{ required: true }]}>
            <Input placeholder="Enter project name" />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input placeholder="e.g. PPV-001" />
          </Form.Item>
          <Form.Item name="client_name" label="Client Name">
            <Input placeholder="Client company name" />
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input placeholder="Project location" />
          </Form.Item>
          <Form.Item name="model_reference" label="Model Reference">
            <Input placeholder="BIM model reference" />
          </Form.Item>
        </>
      }
    />
  )
}
