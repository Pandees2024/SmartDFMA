import { useState } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, Switch, Tag,
  Popconfirm, Typography, Card, message, Tooltip,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'

interface CrudPageProps {
  title: string
  queryKey: string[]
  fetchFn: () => Promise<unknown[]>
  saveFn: (data: Record<string, unknown>) => Promise<unknown>
  deleteFn: (id: number) => Promise<unknown>
  columns: ColumnsType<Record<string, unknown>>
  formFields: React.ReactNode
  defaultValues?: Record<string, unknown>
  extraActions?: React.ReactNode
}

export default function CrudPage({
  title,
  queryKey,
  fetchFn,
  saveFn,
  deleteFn,
  columns,
  formFields,
  defaultValues = {},
  extraActions,
}: CrudPageProps) {
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { Title } = Typography

  const { data = [], isLoading } = useQuery({
    queryKey,
    queryFn: fetchFn as () => Promise<Record<string, unknown>[]>,
  })

  const saveMutation = useMutation({
    mutationFn: saveFn,
    onSuccess: () => {
      message.success(`${title} saved successfully`)
      queryClient.invalidateQueries({ queryKey })
      setOpen(false)
      form.resetFields()
      setEditItem(null)
    },
    onError: () => message.error(`Failed to save ${title}`),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      message.success(`${title} deleted`)
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => message.error(`Failed to delete ${title}`),
  })

  const handleOpen = (item?: Record<string, unknown>) => {
    setEditItem(item || null)
    form.resetFields()
    if (item) {
      form.setFieldsValue({ ...defaultValues, ...item })
    } else {
      form.setFieldsValue({ ...defaultValues, id: 0, status: true })
    }
    setOpen(true)
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    const payload = { ...defaultValues, ...(editItem || {}), ...values, id: editItem?.id || 0 }
    saveMutation.mutate(payload)
  }

  const filteredData = searchText
    ? data.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      )
    : data

  const tableColumns: ColumnsType<Record<string, unknown>> = [
    ...columns,
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleOpen(record)}
              style={{ color: '#1a6fb0' }}
            />
          </Tooltip>
          <Popconfirm
            title={`Delete this ${title}?`}
            onConfirm={() => deleteMutation.mutate(record.id as number)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="link" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="ppvc-page">
      <div className="ppvc-page-header">
        <Title level={3} className="ppvc-page-title">{title} Management</Title>
        <Space>
          {extraActions}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpen()}
            size="large"
          >
            Add {title}
          </Button>
        </Space>
      </div>

      <Card className="ppvc-card">
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={`Search ${title}...`}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ maxWidth: 320, borderRadius: 8 }}
            size="large"
          />
        </div>

        <Table
          dataSource={filteredData as Record<string, unknown>[]}
          columns={tableColumns}
          rowKey="id"
          loading={isLoading}
          className="ppvc-table"
          scroll={{ x: 800 }}
          pagination={{
            defaultPageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `${total} records`,
            style: { marginTop: 16 },
          }}
        />
      </Card>

      <Modal
        title={`${editItem?.id ? 'Edit' : 'Add'} ${title}`}
        open={open}
        onOk={handleSave}
        onCancel={() => { setOpen(false); setEditItem(null); form.resetFields() }}
        confirmLoading={saveMutation.isPending}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ status: true, ...defaultValues }}>
          {formFields}
          <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
