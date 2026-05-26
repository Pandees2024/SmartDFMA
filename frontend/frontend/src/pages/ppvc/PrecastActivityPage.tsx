import { useState } from 'react'
import {
  Card, Form, Select, DatePicker, Button, Row, Col, Typography,
  Table, message, Tag, Space, Input,
} from 'antd'
import { SearchOutlined, ReloadOutlined, SaveOutlined, DeploymentUnitOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import {
  ppvcTransactionApi, projectApi, activityApi, teamApi, moduleApi, moduleStatusApi,
} from '../../api'
import { PPVCTransaction, MODULE_STATUS_LABELS, MODULE_STATUS_COLORS } from '../../types'

const { Title } = Typography

export default function PrecastActivityPage() {
  const [form] = Form.useForm()
  const [tableData, setTableData] = useState<PPVCTransaction[]>([])
  const queryClient = useQueryClient()

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectApi.getAll })
  const { data: parentActivities = [] } = useQuery({
    queryKey: ['activities-precast'],
    queryFn: activityApi.getParentPreCastList,
  })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: teamApi.getAll })
  const { data: modules = [] } = useQuery({ queryKey: ['modules'], queryFn: moduleApi.getAll })
  const { data: statuses = [] } = useQuery({
    queryKey: ['module-statuses'],
    queryFn: moduleStatusApi.getActivityStatusList,
  })

  const filterMutation = useMutation({
    mutationFn: (model: Record<string, unknown>) => ppvcTransactionApi.filterData(model as never, 2),
    onSuccess: (data: { Type?: string; AdditionalData?: { model: PPVCTransaction[] } }) => {
      if (data?.Type === 'S') {
        setTableData(data?.AdditionalData?.model || [])
        message.success(`Loaded ${data?.AdditionalData?.model?.length || 0} records`)
      } else {
        setTableData([])
        message.info('No data found for the selected filters')
      }
    },
    onError: () => message.error('Failed to load data'),
  })

  const updateMutation = useMutation({
    mutationFn: ppvcTransactionApi.updatePreCasting,
    onSuccess: (data: { Type?: string; Message?: string }) => {
      if (data?.Type === 'S') {
        message.success(data.Message || 'Pre-casting data updated successfully')
        queryClient.invalidateQueries({ queryKey: ['ppvc-transactions'] })
      } else {
        message.error(data?.Message || 'Update failed')
      }
    },
    onError: () => message.error('Failed to update pre-casting data'),
  })

  const handleFilter = async () => {
    const values = await form.validateFields()
    filterMutation.mutate({
      Project_id: values.project_id || 0,
      Activity_id: values.activity_id || 0,
      Team_id: values.team_id || 0,
      Module_id: values.module_id || 0,
      StartDate: values.start_date ? values.start_date.toISOString() : null,
      EndDate: values.end_date ? values.end_date.toISOString() : null,
    })
  }

  const handleReset = () => {
    form.resetFields()
    setTableData([])
  }

  const handleSubmit = () => {
    updateMutation.mutate(tableData as never)
  }

  const updateRow = (id: number, field: string, value: unknown) => {
    setTableData(prev => prev.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ))
  }

  const columns = [
    { title: 'S.No', key: 'index', width: 60, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
    {
      title: 'Module', key: 'module', width: 120,
      render: (_: unknown, r: PPVCTransaction) =>
        r.level_id === 1 ? (
          <strong style={{ color: '#1a6fb0' }}>{r.activity?.name}</strong>
        ) : (
          r.module?.name || '-'
        ),
    },
    {
      title: 'Component', key: 'component', width: 120,
      render: (_: unknown, r: PPVCTransaction) =>
        r.level_id === 2 ? r.component?.name || '-' : null,
    },
    {
      title: 'Component ID', key: 'componentCode', width: 120,
      render: (_: unknown, r: PPVCTransaction) =>
        r.level_id === 2 ? r.component?.code || '-' : null,
    },
    {
      title: 'Description', key: 'remarks', width: 160,
      render: (_: unknown, r: PPVCTransaction) => r.component?.remarks || r.remarks || '-',
    },
    {
      title: 'Sub Activity', key: 'subactivity',
      render: (_: unknown, r: PPVCTransaction) => {
        if (r.level_id !== 2 || r.complete_percent === '100') return null
        const subActivities = (r as PPVCTransaction & { subActivities?: { id: number; name: string }[] }).subActivities || []
        return (
          <Select
            size="small"
            style={{ width: '100%', minWidth: 140 }}
            value={r.sub_activity_id || r.SubActivity_id}
            onChange={val => updateRow(r.id, 'SubActivity_id', val)}
            placeholder="Select sub-activity"
          >
            {subActivities.map((sa: { id: number; name: string }) => (
              <Select.Option key={sa.id} value={sa.id}>{sa.name}</Select.Option>
            ))}
          </Select>
        )
      },
    },
    {
      title: 'Actual Start Date', key: 'actualStart',
      render: (_: unknown, r: PPVCTransaction) => {
        if (r.level_id !== 2 || r.complete_percent === '100') return null
        return (
          <DatePicker
            size="small"
            style={{ width: '100%' }}
            value={r.actual_start_date ? dayjs(r.actual_start_date) : null}
            onChange={d => updateRow(r.id, 'ActualStartDate', d?.toISOString())}
            format="DD-MMM-YYYY"
          />
        )
      },
    },
    {
      title: 'Actual End Date', key: 'actualEnd',
      render: (_: unknown, r: PPVCTransaction) => {
        if (r.level_id !== 2 || r.complete_percent === '100') return null
        return (
          <DatePicker
            size="small"
            style={{ width: '100%' }}
            value={r.actual_end_date ? dayjs(r.actual_end_date) : null}
            onChange={d => updateRow(r.id, 'ActualEndDate', d?.toISOString())}
            format="DD-MMM-YYYY"
          />
        )
      },
    },
    {
      title: 'Status', key: 'status', width: 160,
      render: (_: unknown, r: PPVCTransaction) => {
        if (r.level_id === 1) {
          const s = r.planning_module_status || r.PlanningModule_Status || 0
          return <Tag color={MODULE_STATUS_COLORS[s]}>{MODULE_STATUS_LABELS[s]}</Tag>
        }
        if (r.complete_percent === '100') {
          return <Tag color="green">Completed</Tag>
        }
        return (
          <Select
            size="small"
            style={{ width: '100%', minWidth: 140 }}
            value={r.planning_module_status || r.PlanningModule_Status}
            onChange={val => updateRow(r.id, 'PlanningModule_Status', val)}
          >
            {statuses.map(s => (
              <Select.Option key={s.id} value={s.id}>{s.Name}</Select.Option>
            ))}
          </Select>
        )
      },
    },
  ]

  return (
    <div className="ppvc-page">
      <div className="ppvc-page-header">
        <Title level={3} className="ppvc-page-title">
          <DeploymentUnitOutlined style={{ marginRight: 8 }} />
          Module 2 – PPVC Pre-Cast Activity
        </Title>
        {tableData.length > 0 && (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={updateMutation.isPending}
            size="large"
          >
            Submit
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      <div className="ppvc-filter-panel">
        <div className="ppvc-filter-title">Filter Options</div>
        <Form form={form} layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="project_id" label="Project Name">
                <Select placeholder="Select Project" allowClear showSearch optionFilterProp="children">
                  {projects.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="activity_id" label="Current Project Activities">
                <Select placeholder="Select Activity" allowClear showSearch optionFilterProp="children">
                  {parentActivities.map(a => <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="team_id" label="Team">
                <Select placeholder="Select Team" allowClear showSearch optionFilterProp="children">
                  {teams.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="module_id" label="Key Milestones">
                <Select placeholder="Select Module" allowClear showSearch optionFilterProp="children">
                  {modules.map(m => <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="start_date" label="Planned Start Date">
                <DatePicker style={{ width: '100%' }} format="DD-MMM-YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="end_date" label="Planned End Date">
                <DatePicker style={{ width: '100%' }} format="DD-MMM-YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleFilter} loading={filterMutation.isPending} size="large">
              Search
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset} size="large">Reset</Button>
          </div>
        </Form>
      </div>

      {/* Results Table */}
      {tableData.length > 0 && (
        <Card className="ppvc-card ppvc-activity-table">
          <Table
            dataSource={tableData}
            columns={columns as never}
            rowKey="id"
            loading={filterMutation.isPending}
            size="small"
            scroll={{ x: 1200 }}
            rowClassName={(r: PPVCTransaction) =>
              r.level_id === 1 ? 'ppvc-level-1-row' : 'ppvc-level-2-row'
            }
            pagination={{ defaultPageSize: 30, showTotal: t => `${t} records` }}
          />
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={updateMutation.isPending}
              size="large"
            >
              Submit Changes
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
