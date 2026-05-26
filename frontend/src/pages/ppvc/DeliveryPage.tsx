import { useState } from 'react'
import {
  Card, Form, Select, DatePicker, Button, Row, Col, Typography,
  Table, message, Tag, Input,
} from 'antd'
import { SearchOutlined, ReloadOutlined, SaveOutlined, CarOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { ppvcTransactionApi, projectApi, activityApi, teamApi, moduleApi, moduleStatusApi } from '../../api'
import { PPVCTransaction, MODULE_STATUS_LABELS, MODULE_STATUS_COLORS } from '../../types'

const { Title } = Typography

export default function DeliveryPage() {
  const [form] = Form.useForm()
  const [tableData, setTableData] = useState<PPVCTransaction[]>([])

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectApi.getAll })
  const { data: activities = [] } = useQuery({ queryKey: ['activities'], queryFn: activityApi.getAll })
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: teamApi.getAll })
  const { data: modules = [] } = useQuery({ queryKey: ['modules'], queryFn: moduleApi.getAll })
  const { data: statuses = [] } = useQuery({ queryKey: ['module-statuses'], queryFn: moduleStatusApi.getActivityStatusList })

  const filterMutation = useMutation({
    mutationFn: (model: Record<string, unknown>) => ppvcTransactionApi.filterData(model as never, 4),
    onSuccess: (data: { Type?: string; AdditionalData?: { model: PPVCTransaction[] } }) => {
      if (data?.Type === 'S') setTableData(data?.AdditionalData?.model || [])
      else { setTableData([]); message.info('No data found') }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ppvcTransactionApi.updateDeliveryList,
    onSuccess: (data: { Type?: string; Message?: string }) => {
      if (data?.Type === 'S') message.success(data.Message || 'Delivery data updated')
      else message.error(data?.Message || 'Update failed')
    },
    onError: () => message.error('Update failed'),
  })

  const updateRow = (id: number, field: string, value: unknown) => {
    setTableData(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const columns = [
    { title: 'S.No', key: 'index', width: 60, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
    {
      title: 'Module', key: 'module',
      render: (_: unknown, r: PPVCTransaction) => r.level_id === 1
        ? <strong style={{ color: '#1a6fb0' }}>{r.activity?.name}</strong>
        : r.module?.name || '-',
    },
    {
      title: 'Component', key: 'component',
      render: (_: unknown, r: PPVCTransaction) => r.level_id === 2 ? r.component?.name || '-' : null,
    },
    {
      title: 'Component ID', key: 'code',
      render: (_: unknown, r: PPVCTransaction) => r.level_id === 2 ? r.component?.code || '-' : null,
    },
    {
      title: 'Target Location', key: 'target',
      render: (_: unknown, r: PPVCTransaction) => r.level_id !== 2 ? null : (
        <Input size="small" value={r.target_location || r.TargetLocation || ''} onChange={e => updateRow(r.id, 'TargetLocation', e.target.value)} placeholder="Target location" />
      ),
    },
    {
      title: 'Vehicle No', key: 'vehicle',
      render: (_: unknown, r: PPVCTransaction) => r.level_id !== 2 ? null : (
        <Input size="small" value={r.vehicle_no || r.VehicleNo || ''} onChange={e => updateRow(r.id, 'VehicleNo', e.target.value)} placeholder="Vehicle number" />
      ),
    },
    {
      title: 'RFID Tag', key: 'rfid',
      render: (_: unknown, r: PPVCTransaction) => r.level_id !== 2 ? null : (
        <Input size="small" value={r.rfid_tag || r.RFIDTag || ''} onChange={e => updateRow(r.id, 'RFIDTag', e.target.value)} placeholder="RFID tag" />
      ),
    },
    {
      title: 'Actual Start', key: 'actualStart',
      render: (_: unknown, r: PPVCTransaction) => r.level_id !== 2 ? null : (
        <DatePicker size="small" style={{ width: '100%' }} value={r.actual_start_date ? dayjs(r.actual_start_date) : null} onChange={d => updateRow(r.id, 'ActualStartDate', d?.toISOString())} format="DD-MMM-YYYY" />
      ),
    },
    {
      title: 'Actual End', key: 'actualEnd',
      render: (_: unknown, r: PPVCTransaction) => r.level_id !== 2 ? null : (
        <DatePicker size="small" style={{ width: '100%' }} value={r.actual_end_date ? dayjs(r.actual_end_date) : null} onChange={d => updateRow(r.id, 'ActualEndDate', d?.toISOString())} format="DD-MMM-YYYY" />
      ),
    },
    {
      title: 'Status', key: 'status',
      render: (_: unknown, r: PPVCTransaction) => {
        if (r.level_id === 1) {
          const s = r.planning_module_status || r.PlanningModule_Status || 0
          return <Tag color={MODULE_STATUS_COLORS[s]}>{MODULE_STATUS_LABELS[s]}</Tag>
        }
        return (
          <Select size="small" style={{ width: 140 }} value={r.planning_module_status || r.PlanningModule_Status} onChange={val => updateRow(r.id, 'PlanningModule_Status', val)}>
            {statuses.map(s => <Select.Option key={s.id} value={s.id}>{s.Name}</Select.Option>)}
          </Select>
        )
      },
    },
  ]

  return (
    <div className="ppvc-page">
      <div className="ppvc-page-header">
        <Title level={3} className="ppvc-page-title">
          <CarOutlined style={{ marginRight: 8 }} /> Delivery Module
        </Title>
        {tableData.length > 0 && (
          <Button type="primary" icon={<SaveOutlined />} onClick={() => updateMutation.mutate(tableData as never)} loading={updateMutation.isPending} size="large">
            Submit
          </Button>
        )}
      </div>

      <div className="ppvc-filter-panel">
        <div className="ppvc-filter-title">Filter Options</div>
        <Form form={form} layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="project_id" label="Project">
                <Select placeholder="Select Project" allowClear showSearch optionFilterProp="children">
                  {projects.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="activity_id" label="Activity">
                <Select placeholder="Select Activity" allowClear showSearch optionFilterProp="children">
                  {activities.filter(a => !a.parent_activity_id).map(a => (
                    <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>
                  ))}
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
              <Form.Item name="module_id" label="Module">
                <Select placeholder="Select Module" allowClear showSearch optionFilterProp="children">
                  {modules.map(m => <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="start_date" label="Start Date">
                <DatePicker style={{ width: '100%' }} format="DD-MMM-YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="end_date" label="End Date">
                <DatePicker style={{ width: '100%' }} format="DD-MMM-YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<SearchOutlined />}
              onClick={async () => {
                const v = await form.validateFields()
                filterMutation.mutate({ Project_id: v.project_id || 0, Activity_id: v.activity_id || 0, Team_id: v.team_id || 0, Module_id: v.module_id || 0, StartDate: v.start_date?.toISOString(), EndDate: v.end_date?.toISOString() })
              }}
              loading={filterMutation.isPending} size="large">Search</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setTableData([]) }} size="large">Reset</Button>
          </div>
        </Form>
      </div>

      {tableData.length > 0 && (
        <Card className="ppvc-card">
          <Table
            dataSource={tableData}
            columns={columns as never}
            rowKey="id"
            loading={filterMutation.isPending}
            size="small"
            scroll={{ x: 1400 }}
            pagination={{ defaultPageSize: 20, showTotal: t => `${t} records` }}
          />
        </Card>
      )}
    </div>
  )
}
