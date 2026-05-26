import { useState } from 'react'
import {
  Card, Form, Select, DatePicker, Button, Row, Col, Typography,
  Table, message, Spin, Alert, Tag,
} from 'antd'
import { SearchOutlined, ReloadOutlined, BarChartOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { ppvcTransactionApi, projectApi, activityApi, teamApi, moduleApi } from '../../api'
import { PPVCTransaction, GanttChartItem } from '../../types'

const { Title, Text } = Typography

// Simple Gantt chart renderer using HTML
const GanttChart = ({ data }: { data: GanttChartItem[] }) => {
  if (!data.length) return <Alert message="No Gantt data available. Please apply filters." type="info" />

  const colorMap: Record<string, string> = {
    gtaskred: '#f5222d',
    gtaskblue: '#1a6fb0',
    gtaskgreen: '#52c41a',
    gtaskyellow: '#faad14',
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#1a6fb0', color: '#fff' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', minWidth: 200 }}>Task Name</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', width: 100 }}>Start Date</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', width: 100 }}>End Date</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', width: 80 }}>Resource</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', width: 100 }}>Progress</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={item.id}
              style={{
                background: item.pGroup ? '#e8f4fd' : idx % 2 === 0 ? '#fff' : '#fafbff',
                fontWeight: item.pGroup ? 700 : 400,
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <td style={{ padding: '8px 12px', paddingLeft: item.pGroup ? 12 : 24 }}>
                {item.pName}
              </td>
              <td style={{ padding: '8px 12px' }}>{item.pStart}</td>
              <td style={{ padding: '8px 12px' }}>{item.pEnd}</td>
              <td style={{ padding: '8px 12px' }}>{item.pRes}</td>
              <td style={{ padding: '8px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      height: 16,
                      width: `${item.pComp}%`,
                      minWidth: 4,
                      background: colorMap[item.pClass] || '#1a6fb0',
                      borderRadius: 4,
                      maxWidth: 100,
                    }}
                  />
                  <span>{item.pComp}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PlanningModulePage() {
  const [form] = Form.useForm()
  const [ganttData, setGanttData] = useState<GanttChartItem[]>([])

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectApi.getAll })
  const { data: activities = [] } = useQuery({ queryKey: ['activities'], queryFn: activityApi.getAll })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: teamApi.getAll })
  const { data: modules = [] } = useQuery({ queryKey: ['modules'], queryFn: moduleApi.getAll })

  const filterMutation = useMutation({
    mutationFn: (model: Record<string, unknown>) => ppvcTransactionApi.filterGanttData(model as never),
    onSuccess: (data) => {
      if (data?.Type === 'S' && data?.AdditionalData?.model) {
        setGanttData(data.AdditionalData.model)
        message.success(`Loaded ${data.AdditionalData.model.length} records`)
      } else {
        setGanttData([])
        message.info('No data found for the selected filters')
      }
    },
    onError: () => message.error('Failed to load planning data'),
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
    setGanttData([])
  }

  return (
    <div className="ppvc-page">
      <div className="ppvc-page-header">
        <Title level={3} className="ppvc-page-title">
          <BarChartOutlined style={{ marginRight: 8 }} />
          Planning Module — Gantt Chart
        </Title>
      </div>

      {/* Filter Panel */}
      <div className="ppvc-filter-panel">
        <div className="ppvc-filter-title">Filter Options</div>
        <Form form={form} layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="project_id" label="Project">
                <Select placeholder="All Projects" allowClear showSearch optionFilterProp="children">
                  {projects.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="activity_id" label="Activity">
                <Select placeholder="All Activities" allowClear showSearch optionFilterProp="children">
                  {activities.filter(a => !a.parent_activity_id).map(a => (
                    <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="team_id" label="Team">
                <Select placeholder="All Teams" allowClear showSearch optionFilterProp="children">
                  {teams.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="module_id" label="Key Milestones / Module">
                <Select placeholder="All Modules" allowClear showSearch optionFilterProp="children">
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
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleFilter}
              loading={filterMutation.isPending}
              size="large"
            >
              Search
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset} size="large">
              Reset
            </Button>
          </div>
        </Form>
      </div>

      {/* Gantt Chart */}
      {filterMutation.isPending ? (
        <Card className="ppvc-card">
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Spin size="large" tip="Loading Gantt chart data..." />
          </div>
        </Card>
      ) : (
        <Card
          className="ppvc-card"
          title={
            <span>
              Gantt Chart
              {ganttData.length > 0 && (
                <Tag color="blue" style={{ marginLeft: 8 }}>{ganttData.length} tasks</Tag>
              )}
            </span>
          }
        >
          <div className="ppvc-gantt-container">
            <GanttChart data={ganttData} />
          </div>

          {ganttData.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
              <BarChartOutlined style={{ fontSize: 48, opacity: 0.3 }} />
              <div style={{ marginTop: 16 }}>
                Use the filter above to load Gantt chart data
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
