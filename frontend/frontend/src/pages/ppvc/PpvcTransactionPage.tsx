import { useState, useRef } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, Select, DatePicker,
  Upload, Typography, Card, message, Tag, Popconfirm, Tooltip, Divider,
} from 'antd'
import {
  PlusOutlined, UploadOutlined, DownloadOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import {
  ppvcTransactionApi, projectApi, moduleApi, activityApi,
  teamApi, componentApi,
} from '../../api'
import { PPVCTransaction, MODULE_STATUS_LABELS, MODULE_STATUS_COLORS } from '../../types'

const { Title } = Typography

export default function PpvcTransactionPage() {
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<PPVCTransaction | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['ppvc-transactions'],
    queryFn: ppvcTransactionApi.getAll,
  })
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectApi.getAll })
  const { data: modules = [] } = useQuery({ queryKey: ['modules'], queryFn: moduleApi.getAll })
  const { data: activities = [] } = useQuery({ queryKey: ['activities'], queryFn: activityApi.getAll })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: teamApi.getAll })
  const { data: components = [] } = useQuery({ queryKey: ['components'], queryFn: componentApi.getAll })

  const saveMutation = useMutation({
    mutationFn: ppvcTransactionApi.saveOrUpdate,
    onSuccess: () => {
      message.success('Saved successfully')
      queryClient.invalidateQueries({ queryKey: ['ppvc-transactions'] })
      setOpen(false)
      setEditItem(null)
      form.resetFields()
    },
    onError: () => message.error('Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ppvcTransactionApi.delete(id),
    onSuccess: () => {
      message.success('Deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['ppvc-transactions'] })
    },
  })

  const importMutation = useMutation({
    mutationFn: ppvcTransactionApi.importMany,
    onSuccess: (data: { Type?: string; Message?: string }) => {
      if (data?.Type === 'S') {
        message.success(data.Message || 'Import successful')
        queryClient.invalidateQueries({ queryKey: ['ppvc-transactions'] })
      } else {
        message.error(data?.Message || 'Import failed')
      }
    },
    onError: () => message.error('Import failed'),
  })

  const handleOpen = (item?: PPVCTransaction) => {
    setEditItem(item || null)
    form.resetFields()
    if (item) {
      form.setFieldsValue({
        ...item,
        project_id: item.project_id || item.Project_id,
        module_id: item.module_id || item.Module_id,
        activity_id: item.activity_id || item.Activity_id,
        component_id: item.component_id || item.Component_id,
        team_id: item.team_id || item.Team_id,
        start_date: item.start_date ? dayjs(item.start_date) : null,
        end_date: item.end_date ? dayjs(item.end_date) : null,
        actual_start_date: item.actual_start_date ? dayjs(item.actual_start_date) : null,
        actual_end_date: item.actual_end_date ? dayjs(item.actual_end_date) : null,
      })
    }
    setOpen(true)
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    const payload: Partial<PPVCTransaction> = {
      ...values,
      id: editItem?.id || 0,
      Project_id: values.project_id,
      Module_id: values.module_id,
      Activity_id: values.activity_id,
      Component_id: values.component_id,
      Team_id: values.team_id,
      StartDate: values.start_date?.toISOString(),
      EndDate: values.end_date?.toISOString(),
      ActualStartDate: values.actual_start_date?.toISOString(),
      ActualEndDate: values.actual_end_date?.toISOString(),
    }
    saveMutation.mutate(payload)
  }

  // Export to Excel
  const handleExport = () => {
    const exportData = transactions.map((t, idx) => ({
      'S.No': idx + 1,
      'Project': t.project?.name || '',
      'Module': t.module?.name || '',
      'Component': t.component?.name || '',
      'Component Code': t.component?.code || '',
      'Activity': t.activity?.name || '',
      'Sub Activity': t.sub_activity?.name || '',
      'Team': t.team?.name || '',
      'Man Days': t.man_days || '',
      'Start Date': t.start_date || '',
      'End Date': t.end_date || '',
      'Status': MODULE_STATUS_LABELS[t.planning_module_status || t.PlanningModule_Status || 0] || '',
      'Complete %': t.complete_percent || '0',
      'Level': t.level_id || '',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'PPVC Transactions')
    XLSX.writeFile(wb, `PPVC_Transactions_${dayjs().format('YYYYMMDD')}.xlsx`)
    message.success('Exported successfully')
  }

  // Import from Excel
  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false })

      if (!jsonData.length) { message.warning('No data found in file'); return }

      // Map Excel columns to API format
      const mapped = jsonData.map(row => ({
        ProjectName: String(row['Project'] || row['ProjectName'] || ''),
        ModuleName: String(row['Module'] || row['ModuleName'] || ''),
        ActivityName: String(row['Activity'] || row['ActivityName'] || ''),
        SubActivityName: String(row['Sub Activity'] || row['SubActivityName'] || ''),
        ComponentName: String(row['Component'] || row['ComponentName'] || row['Component Code'] || ''),
        TeamName: String(row['Team'] || row['TeamName'] || ''),
        ManDays: row['Man Days'] || row['ManDays'],
        StartDate: row['Start Date'] || row['StartDate'],
        EndDate: row['End Date'] || row['EndDate'],
        Unit_Level_No: String(row['Unit Level'] || row['Unit_Level_No'] || ''),
      }))

      importMutation.mutate(mapped as never)
    }
    reader.readAsBinaryString(file)
    return false // prevent default upload
  }

  const columns = [
    { title: '#', key: 'index', width: 50, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
    {
      title: 'Project', key: 'project',
      render: (_: unknown, r: PPVCTransaction) => r.project?.name || '-',
      ellipsis: true,
    },
    {
      title: 'Module', key: 'module',
      render: (_: unknown, r: PPVCTransaction) => r.module?.name || '-',
      ellipsis: true,
    },
    {
      title: 'Component', key: 'component',
      render: (_: unknown, r: PPVCTransaction) => r.component?.name || '-',
      ellipsis: true,
    },
    {
      title: 'Activity', key: 'activity',
      render: (_: unknown, r: PPVCTransaction) => r.activity?.name || '-',
      ellipsis: true,
    },
    {
      title: 'Team', key: 'team',
      render: (_: unknown, r: PPVCTransaction) => r.team?.name || '-',
    },
    { title: 'Level', dataIndex: 'level_id', key: 'level_id', width: 65 },
    {
      title: 'Status', key: 'status',
      width: 140,
      render: (_: unknown, r: PPVCTransaction) => {
        const s = r.planning_module_status || r.PlanningModule_Status || 0
        return <Tag color={MODULE_STATUS_COLORS[s]}>{MODULE_STATUS_LABELS[s]}</Tag>
      },
    },
    {
      title: 'Complete %', key: 'complete',
      width: 90,
      render: (_: unknown, r: PPVCTransaction) => `${r.complete_percent || '0'}%`,
    },
    {
      title: 'Actions', key: 'actions', width: 90, fixed: 'right' as const,
      render: (_: unknown, r: PPVCTransaction) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleOpen(r)} />
          </Tooltip>
          <Popconfirm
            title="Delete this record?"
            onConfirm={() => deleteMutation.mutate(r.id)}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="link" size="small" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="ppvc-page">
      <div className="ppvc-page-header">
        <Title level={3} className="ppvc-page-title">PPVC Transactions</Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export Excel
          </Button>
          <Upload
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <Button
              icon={<UploadOutlined />}
              loading={importMutation.isPending}
            >
              Import Excel
            </Button>
          </Upload>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpen()}
          >
            Add Transaction
          </Button>
        </Space>
      </div>

      <Card className="ppvc-card">
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          className="ppvc-table"
          scroll={{ x: 1200 }}
          size="small"
          rowClassName={(r: PPVCTransaction) =>
            r.level_id === 1 ? 'ant-table-row-selected' : ''
          }
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `${total} records`,
          }}
        />
      </Card>

      <Modal
        title={`${editItem?.id ? 'Edit' : 'Add'} PPVC Transaction`}
        open={open}
        onOk={handleSave}
        onCancel={() => { setOpen(false); setEditItem(null); form.resetFields() }}
        confirmLoading={saveMutation.isPending}
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="project_id" label="Project">
              <Select showSearch optionFilterProp="children" placeholder="Select project" allowClear>
                {projects.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="module_id" label="Module">
              <Select showSearch optionFilterProp="children" placeholder="Select module" allowClear>
                {modules.map(m => <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="activity_id" label="Activity">
              <Select showSearch optionFilterProp="children" placeholder="Select activity" allowClear>
                {activities.filter(a => !a.parent_activity_id).map(a => (
                  <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="sub_activity_id" label="Sub Activity">
              <Select showSearch optionFilterProp="children" placeholder="Select sub activity" allowClear>
                {activities.filter(a => a.parent_activity_id).map(a => (
                  <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="component_id" label="Component">
              <Select showSearch optionFilterProp="children" placeholder="Select component" allowClear>
                {components.map(c => <Select.Option key={c.id} value={c.id}>{c.name} ({c.code})</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="team_id" label="Team">
              <Select showSearch optionFilterProp="children" placeholder="Select team" allowClear>
                {teams.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="start_date" label="Start Date">
              <DatePicker style={{ width: '100%' }} format="DD-MMM-YYYY" />
            </Form.Item>
            <Form.Item name="end_date" label="End Date">
              <DatePicker style={{ width: '100%' }} format="DD-MMM-YYYY" />
            </Form.Item>
            <Form.Item name="man_days" label="Man Days">
              <Input type="number" placeholder="0" />
            </Form.Item>
            <Form.Item name="lead_time" label="Lead Time (days)">
              <Input type="number" placeholder="0" />
            </Form.Item>
            <Form.Item name="planning_module_status" label="Status">
              <Select placeholder="Select status">
                {Object.entries(MODULE_STATUS_LABELS).map(([id, label]) => (
                  <Select.Option key={id} value={parseInt(id)}>{label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="level_id" label="Level">
              <Select placeholder="Select level">
                <Select.Option value={1}>Level 1 (Header)</Select.Option>
                <Select.Option value={2}>Level 2 (Component Row)</Select.Option>
                <Select.Option value={3}>Level 3 (Sub-Activity)</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={2} placeholder="Additional notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
