import { Row, Col, Card, Statistic, Table, Tag, Progress, Typography, Divider } from 'antd'
import {
  ProjectOutlined, AppstoreOutlined, DeploymentUnitOutlined,
  CarOutlined, SafetyOutlined, CheckCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { projectApi, ppvcTransactionApi } from '../../api'
import { MODULE_STATUS_LABELS, MODULE_STATUS_COLORS } from '../../types'

const { Title } = Typography

export default function DashboardPage() {
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectApi.getAll })
  const { data: transactions = [] } = useQuery({ queryKey: ['ppvc-transactions'], queryFn: ppvcTransactionApi.getAll })

  const levelTwoTxns = transactions.filter(t => t.level_id === 2 || t.Level_id === 2)
  const completedCount = levelTwoTxns.filter(t => (t.planning_module_status || t.PlanningModule_Status || 0) >= 6).length
  const inProgressCount = levelTwoTxns.filter(t => [2,3,4,5].includes(t.planning_module_status || t.PlanningModule_Status || 0)).length
  const notStartedCount = levelTwoTxns.filter(t => (t.planning_module_status || t.PlanningModule_Status || 0) <= 1).length

  const overallProgress = levelTwoTxns.length > 0 ? Math.round((completedCount / levelTwoTxns.length) * 100) : 0

  const recentTransactions = [...transactions]
    .filter(t => t.level_id === 2 || t.Level_id === 2)
    .slice(0, 8)

  const statusCols = [
    { title: 'Module', dataIndex: ['module', 'name'], key: 'module', render: (_: unknown, r: Record<string, unknown>) => (r.module as { name: string })?.name || '-' },
    { title: 'Component', dataIndex: ['component', 'name'], key: 'component', render: (_: unknown, r: Record<string, unknown>) => (r.component as { name: string })?.name || '-' },
    { title: 'Activity', dataIndex: ['activity', 'name'], key: 'activity', render: (_: unknown, r: Record<string, unknown>) => (r.activity as { name: string })?.name || '-' },
    {
      title: 'Status', key: 'status',
      render: (_: unknown, r: Record<string, unknown>) => {
        const status = (r.planning_module_status || r.PlanningModule_Status || 0) as number
        return <Tag color={MODULE_STATUS_COLORS[status]}>{MODULE_STATUS_LABELS[status]}</Tag>
      },
    },
    {
      title: 'Progress', key: 'progress',
      render: (_: unknown, r: Record<string, unknown>) => {
        const pct = parseInt(String(r.complete_percent || r.CompletePercent || '0'))
        return <Progress percent={pct} size="small" style={{ width: 100 }} />
      },
    },
  ]

  return (
    <div className="ppvc-page">
      <div className="ppvc-page-header">
        <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ppvc-stat-card" style={{ background: 'linear-gradient(135deg, #1a6fb0, #0f4c7d)', border: 'none' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Projects</span>}
              value={projects.length}
              prefix={<ProjectOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontWeight: 800, fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ppvc-stat-card" style={{ background: 'linear-gradient(135deg, #52c41a, #389e0d)', border: 'none' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Completed Units</span>}
              value={completedCount}
              prefix={<CheckCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontWeight: 800, fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ppvc-stat-card" style={{ background: 'linear-gradient(135deg, #fa8c16, #d46b08)', border: 'none' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>In Progress</span>}
              value={inProgressCount}
              prefix={<ClockCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontWeight: 800, fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ppvc-stat-card" style={{ background: 'linear-gradient(135deg, #13c2c2, #08979c)', border: 'none' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Transactions</span>}
              value={levelTwoTxns.length}
              prefix={<AppstoreOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontWeight: 800, fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card className="ppvc-card" title="Overall Progress">
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Progress
                type="circle"
                percent={overallProgress}
                size={160}
                strokeColor={{ '0%': '#1a6fb0', '100%': '#13c2c2' }}
                format={p => <span style={{ fontSize: 24, fontWeight: 800 }}>{p}%</span>}
              />
              <div style={{ marginTop: 16, fontSize: 14, color: '#6b7280' }}>Construction Completion</div>
            </div>
            <Divider />
            <Row gutter={16}>
              <Col span={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{completedCount}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Completed</div>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fa8c16' }}>{inProgressCount}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>In Progress</div>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#d9d9d9' }}>{notStartedCount}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Not Started</div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card className="ppvc-card" title="Workflow Status Overview">
            <Row gutter={[12, 12]}>
              {Object.entries(MODULE_STATUS_LABELS).map(([id, label]) => {
                const count = levelTwoTxns.filter(t => (t.planning_module_status || t.PlanningModule_Status || 0) === parseInt(id)).length
                return (
                  <Col xs={12} sm={8} md={6} key={id}>
                    <div style={{
                      background: '#f8faff',
                      borderRadius: 10,
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid #e8f4fd',
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#1a6fb0' }}>{count}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{label}</div>
                    </div>
                  </Col>
                )
              })}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions Table */}
      <Card className="ppvc-card" title="Recent PPVC Transactions">
        <Table
          dataSource={recentTransactions}
          columns={statusCols as never}
          rowKey="id"
          pagination={false}
          className="ppvc-table"
          size="small"
        />
      </Card>
    </div>
  )
}
