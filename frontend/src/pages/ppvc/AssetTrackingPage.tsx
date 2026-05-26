import { useState } from 'react'
import {
  Card, Form, Select, Button, Row, Col, Typography,
  Table, Tag, Progress, Statistic,
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ppvcTransactionApi, projectApi, moduleApi } from '../../api'
import { PPVCTransaction, MODULE_STATUS_LABELS, MODULE_STATUS_COLORS } from '../../types'

const { Title } = Typography

export default function AssetTrackingPage() {
  const [tableData, setTableData] = useState<PPVCTransaction[]>([])
  const [form] = Form.useForm()

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectApi.getAll })
  const { data: modules = [] } = useQuery({ queryKey: ['modules'], queryFn: moduleApi.getAll })

  const { data: allTransactions = [] } = useQuery({
    queryKey: ['ppvc-transactions-asset'],
    queryFn: ppvcTransactionApi.getAll,
  })

  const levelTwo = allTransactions.filter(t => t.level_id === 2 || t.Level_id === 2)
  const completed = levelTwo.filter(t => (t.planning_module_status || t.PlanningModule_Status || 0) >= 6).length
  const overallPct = levelTwo.length > 0 ? Math.round((completed / levelTwo.length) * 100) : 0

  const filterMutation = useMutation({
    mutationFn: (model: Record<string, unknown>) => ppvcTransactionApi.filterData(model as never, 1),
    onSuccess: (data: { Type?: string; AdditionalData?: { model: PPVCTransaction[] } }) => {
      if (data?.Type === 'S') setTableData(data?.AdditionalData?.model || [])
      else setTableData([])
    },
  })

  const columns = [
    { title: '#', key: 'index', width: 50, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
    {
      title: 'Project', key: 'project',
      render: (_: unknown, r: PPVCTransaction) => r.project?.name || '-',
    },
    {
      title: 'Module', key: 'module',
      render: (_: unknown, r: PPVCTransaction) => r.module?.name || '-',
    },
    {
      title: 'Component', key: 'component',
      render: (_: unknown, r: PPVCTransaction) => r.component?.name || '-',
    },
    {
      title: 'Component ID', key: 'code',
      render: (_: unknown, r: PPVCTransaction) => r.component?.code || '-',
    },
    {
      title: 'Activity', key: 'activity',
      render: (_: unknown, r: PPVCTransaction) => r.activity?.name || '-',
    },
    {
      title: 'Status', key: 'status',
      render: (_: unknown, r: PPVCTransaction) => {
        const s = r.planning_module_status || r.PlanningModule_Status || 0
        return <Tag color={MODULE_STATUS_COLORS[s]}>{MODULE_STATUS_LABELS[s]}</Tag>
      },
    },
    {
      title: 'Progress', key: 'progress',
      render: (_: unknown, r: PPVCTransaction) => {
        const pct = parseInt(String(r.complete_percent || r.CompletePercent || '0'))
        return <Progress percent={pct} size="small" style={{ width: 100 }} />
      },
    },
    { title: 'RFID', key: 'rfid', render: (_: unknown, r: PPVCTransaction) => r.component?.rfid || r.rfid_tag || r.RFIDTag || '-' },
  ]

  return (
    <div className="ppvc-page">
      <div className="ppvc-page-header">
        <Title level={3} className="ppvc-page-title">Asset Tracking Summary</Title>
      </div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card className="ppvc-stat-card" style={{ background: 'linear-gradient(135deg, #1a6fb0, #0f4c7d)', border: 'none' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Components</span>}
              value={levelTwo.length}
              valueStyle={{ color: '#fff', fontWeight: 800 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="ppvc-stat-card" style={{ background: 'linear-gradient(135deg, #52c41a, #389e0d)', border: 'none' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Delivered</span>}
              value={completed}
              valueStyle={{ color: '#fff', fontWeight: 800 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="ppvc-stat-card" style={{ background: 'linear-gradient(135deg, #13c2c2, #08979c)', border: 'none' }}>
            <div style={{ padding: '12px 0', textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={overallPct}
                size={80}
                strokeColor="#fff"
                trailColor="rgba(255,255,255,0.3)"
                format={p => <span style={{ color: '#fff', fontWeight: 800 }}>{p}%</span>}
              />
              <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, fontSize: 13 }}>Overall Progress</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <div className="ppvc-filter-panel">
        <div className="ppvc-filter-title">Filter</div>
        <Form form={form} layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="project_id" label="Project">
                <Select placeholder="All Projects" allowClear showSearch optionFilterProp="children">
                  {projects.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="module_id" label="Module">
                <Select placeholder="All Modules" allowClear showSearch optionFilterProp="children">
                  {modules.map(m => <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<SearchOutlined />}
              onClick={async () => {
                const v = await form.validateFields()
                filterMutation.mutate({ Project_id: v.project_id || 0, Module_id: v.module_id || 0 })
              }}
              loading={filterMutation.isPending} size="large">Search</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setTableData([]) }} size="large">Reset</Button>
          </div>
        </Form>
      </div>

      <Card className="ppvc-card">
        <Table
          dataSource={tableData.length > 0 ? tableData : levelTwo}
          columns={columns as never}
          rowKey="id"
          loading={filterMutation.isPending}
          className="ppvc-table"
          size="small"
          scroll={{ x: 1100 }}
          pagination={{ defaultPageSize: 20, showTotal: t => `${t} records` }}
        />
      </Card>
    </div>
  )
}
