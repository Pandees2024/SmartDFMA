import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

// Helper to normalize string for matching (remove spaces, lowercase)
const normalizeStr = (s: string): string => s.replace(/\s/g, '').toLowerCase();

// Status mapping: 1=Planned,2=InProgress,3=PreCastComplete,4=QCPassed,5=ReadyForDelivery,6=Delivered,7=Installed,8=NextUnlocked
const PRE_CASTING_ACTIVITY_IDS = [1, 3, 6];
const QC_ACTIVITY_IDS = [2, 4, 7];
const DELIVERY_ACTIVITY_ID = 5;

// ── Helper: Get or create entity by name ─────────────────────────────────────
async function getOrCreateProject(name: string): Promise<number> {
  const existing = await prisma.project.findFirst({
    where: { name: { contains: name.replace(/\s/g, '') }, deleted_at: null },
  });
  if (existing) return existing.id;
  // Try exact match via JS (Prisma doesn't support regex natively)
  const all = await prisma.project.findMany({ where: { deleted_at: null } });
  const match = all.find(p => normalizeStr(p.name) === normalizeStr(name));
  if (match) return match.id;
  const created = await prisma.project.create({ data: { name, status: true } });
  return created.id;
}

async function getOrCreateModule(name: string): Promise<number> {
  const all = await prisma.module.findMany({ where: { deleted_at: null } });
  const match = all.find(m => normalizeStr(m.name) === normalizeStr(name));
  if (match) return match.id;
  const created = await prisma.module.create({ data: { name, unit_id: 1, status: true } });
  return created.id;
}

async function getOrCreateActivity(name: string, parentId?: number): Promise<number> {
  const all = await prisma.activity.findMany({ where: { deleted_at: null } });
  const match = all.find(a => normalizeStr(a.name) === normalizeStr(name));
  if (match) return match.id;
  const created = await prisma.activity.create({
    data: { name, parent_activity_id: parentId || null, status: true },
  });
  return created.id;
}

async function getOrCreateComponent(name: string): Promise<number> {
  const all = await prisma.component.findMany({ where: { deleted_at: null } });
  const match = all.find(c => normalizeStr(c.code || '') === normalizeStr(name) || normalizeStr(c.name) === normalizeStr(name));
  if (match) return match.id;
  const created = await prisma.component.create({
    data: { name, code: name, module_id: 1, material_id: 1, status: true },
  });
  return created.id;
}

async function getOrCreateTeam(name: string): Promise<number> {
  const all = await prisma.team.findMany({ where: { deleted_at: null } });
  const match = all.find(t => normalizeStr(t.name || '') === normalizeStr(name));
  if (match) return match.id;
  const created = await prisma.team.create({ data: { name, status: true } });
  return created.id;
}

// ── Update percentage completion ─────────────────────────────────────────────
async function updatePercentage(activityId: number, moduleId: number, componentId: number | null): Promise<number> {
  const levelTwoRecord = await prisma.pPVCTransaction.findFirst({
    where: { activity_id: activityId, module_id: moduleId, component_id: componentId, level_id: 2, deleted_at: null },
  });
  if (!levelTwoRecord) return 0;

  const subActivityCount = await prisma.activity.count({
    where: { parent_activity_id: activityId, deleted_at: null },
  });
  const completedCount = await prisma.pPVCTransaction.count({
    where: {
      activity_id: activityId,
      module_id: moduleId,
      component_id: componentId,
      level_id: 3,
      planning_module_status: { in: [3, 4, 6] },
      deleted_at: null,
    },
  });

  const percent = subActivityCount > 0 ? Math.min(100, Math.round((100 * completedCount) / subActivityCount)) : 0;

  await prisma.pPVCTransaction.update({
    where: { id: levelTwoRecord.id },
    data: {
      complete_percent: percent.toString(),
      planning_module_status: percent === 100 ? 3 : 2,
    },
  });

  return percent;
}

// ── Update next level status when 100% complete ──────────────────────────────
async function updateNextLevelStatus(activityId: number, moduleId: number, componentId: number | null, nextActivityId: number): Promise<void> {
  const nextRecord = await prisma.pPVCTransaction.findFirst({
    where: { activity_id: nextActivityId, module_id: moduleId, component_id: componentId, level_id: 2, deleted_at: null },
  });
  if (nextRecord) {
    await prisma.pPVCTransaction.update({
      where: { id: nextRecord.id },
      data: { planning_module_status: 8 },
    });
  }
}

// ── Build filter WHERE clause ────────────────────────────────────────────────
function buildFilterWhere(model: Record<string, unknown>, pageId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { deleted_at: null };

  if (model.project_id || model.Project_id) where.project_id = Number(model.project_id || model.Project_id);
  if (model.module_id || model.Module_id) where.module_id = Number(model.module_id || model.Module_id);
  if (model.activity_id || model.Activity_id) where.activity_id = Number(model.activity_id || model.Activity_id);
  if (model.team_id || model.Team_id) where.team_id = Number(model.team_id || model.Team_id);

  const startDate = model.start_date || model.StartDate;
  const endDate = model.end_date || model.EndDate;
  if (startDate && endDate) {
    where.start_date = { gte: new Date(String(startDate)) };
    where.end_date = { lte: new Date(String(endDate)) };
  }

  if (pageId === 1) {
    where.level_id = { not: 3 };
  } else if (pageId === 2) {
    where.level_id = { not: 3 };
    where.activity_id = { in: PRE_CASTING_ACTIVITY_IDS };
    where.planning_module_status = { not: 0 };
  } else if (pageId === 3) {
    where.level_id = { not: 3 };
    where.activity_id = { in: QC_ACTIVITY_IDS };
    where.planning_module_status = { not: 0 };
  } else if (pageId === 4) {
    where.level_id = { not: 3 };
    where.activity_id = DELIVERY_ACTIVITY_ID;
    where.planning_module_status = { not: 0 };
  }

  return where;
}

// ── Main PPVC Transaction Service ────────────────────────────────────────────
export const ppvcTransactionService = {
  // Get all transactions with related data
  async getAll() {
    return prisma.pPVCTransaction.findMany({
      where: { deleted_at: null },
      include: {
        project: true,
        module: true,
        activity: true,
        sub_activity: true,
        component: true,
        team: true,
      },
      orderBy: { id: 'asc' },
    });
  },

  async getById(id: number) {
    const item = await prisma.pPVCTransaction.findFirst({
      where: { id, deleted_at: null },
      include: {
        project: true,
        module: true,
        activity: true,
        sub_activity: true,
        component: true,
        team: true,
      },
    });
    if (!item) throw new AppError('PPVC Transaction not found', 404);
    return item;
  },

  async saveOrUpdate(data: Record<string, unknown>) {
    const processedData = {
      project_id: data.Project_id ? Number(data.Project_id) : (data.project_id ? Number(data.project_id) : null),
      module_id: data.Module_id ? Number(data.Module_id) : (data.module_id ? Number(data.module_id) : null),
      activity_id: data.Activity_id ? Number(data.Activity_id) : (data.activity_id ? Number(data.activity_id) : null),
      sub_activity_id: data.SubActivity_id ? Number(data.SubActivity_id) : (data.sub_activity_id ? Number(data.sub_activity_id) : null),
      component_id: data.Component_id ? Number(data.Component_id) : (data.component_id ? Number(data.component_id) : null),
      man_days: data.ManDays ? Number(data.ManDays) : (data.man_days ? Number(data.man_days) : null),
      team_id: data.Team_id ? Number(data.Team_id) : (data.team_id ? Number(data.team_id) : null),
      start_date: data.StartDate ? new Date(String(data.StartDate)) : (data.start_date ? new Date(String(data.start_date)) : null),
      end_date: data.EndDate ? new Date(String(data.EndDate)) : (data.end_date ? new Date(String(data.end_date)) : null),
      dependency: data.Dependency ? Number(data.Dependency) : (data.dependency ? Number(data.dependency) : null),
      lead_time: data.LeadTime ? Number(data.LeadTime) : (data.lead_time ? Number(data.lead_time) : null),
      complete_percent: String(data.CompletePercent || data.complete_percent || '0'),
      planning_module_status: data.PlanningModule_Status ? Number(data.PlanningModule_Status) : (data.planning_module_status ? Number(data.planning_module_status) : 0),
      actual_start_date: data.ActualStartDate ? new Date(String(data.ActualStartDate)) : (data.actual_start_date ? new Date(String(data.actual_start_date)) : null),
      actual_end_date: data.ActualEndDate ? new Date(String(data.ActualEndDate)) : (data.actual_end_date ? new Date(String(data.actual_end_date)) : null),
      remarks: String(data.Remarks || data.remarks || ''),
      level_id: data.Level_id ? Number(data.Level_id) : (data.level_id ? Number(data.level_id) : 1),
      unit_level_no: String(data.Unit_Level_No || data.unit_level_no || ''),
      status: true,
    };

    const id = data.id ? Number(data.id) : 0;
    if (id > 0) {
      const updated = await prisma.pPVCTransaction.update({ where: { id }, data: processedData });
      return { ...updated, updated: true };
    }
    const created = await prisma.pPVCTransaction.create({ data: processedData });
    return { ...created, updated: false };
  },

  async delete(id: number) {
    await prisma.pPVCTransaction.update({ where: { id }, data: { deleted_at: new Date() } });
  },

  // ── Excel Import: auto-create entities as needed ────────────────────────────
  async importPPVCTransaction(items: Record<string, unknown>[]) {
    if (!items.length) throw new AppError('No data provided', 400);

    const resolvedItems: Record<string, unknown>[] = [];

    for (const item of items) {
      const resolved = { ...item };

      if (item.ProjectName) resolved.project_id = await getOrCreateProject(String(item.ProjectName));
      if (item.ModuleName) resolved.module_id = await getOrCreateModule(String(item.ModuleName));
      if (item.ActivityName) resolved.activity_id = await getOrCreateActivity(String(item.ActivityName));
      if (item.SubActivityName && resolved.activity_id) {
        resolved.sub_activity_id = await getOrCreateActivity(String(item.SubActivityName), Number(resolved.activity_id));
      }
      if (item.ComponentName) resolved.component_id = await getOrCreateComponent(String(item.ComponentName));
      if (item.TeamName) resolved.team_id = await getOrCreateTeam(String(item.TeamName));

      resolvedItems.push(resolved);
    }

    // Group by activity to create Level 1 (header) and Level 2 (component rows)
    const activityIds = [...new Set(resolvedItems.map(i => i.activity_id))];

    for (const activityId of activityIds) {
      const groupItems = resolvedItems.filter(i => i.activity_id === activityId);
      const firstItem = groupItems[0];

      // Create Level 1 header record
      await prisma.pPVCTransaction.create({
        data: {
          project_id: firstItem.project_id ? Number(firstItem.project_id) : null,
          module_id: firstItem.module_id ? Number(firstItem.module_id) : null,
          activity_id: activityId ? Number(activityId) : null,
          level_id: 1,
          planning_module_status: 1,
          complete_percent: '0',
          unit_level_no: String(firstItem.Unit_Level_No || ''),
          status: true,
        },
      });

      // Create Level 2 rows for each item in this activity group
      for (const childItem of groupItems) {
        await prisma.pPVCTransaction.create({
          data: {
            project_id: childItem.project_id ? Number(childItem.project_id) : null,
            module_id: childItem.module_id ? Number(childItem.module_id) : null,
            activity_id: activityId ? Number(activityId) : null,
            sub_activity_id: childItem.sub_activity_id ? Number(childItem.sub_activity_id) : null,
            component_id: childItem.component_id ? Number(childItem.component_id) : null,
            team_id: childItem.team_id ? Number(childItem.team_id) : null,
            man_days: childItem.ManDays ? Number(childItem.ManDays) : null,
            start_date: childItem.StartDate ? new Date(String(childItem.StartDate)) : null,
            end_date: childItem.EndDate ? new Date(String(childItem.EndDate)) : null,
            complete_percent: '0',
            level_id: 2,
            planning_module_status: Number(activityId) === 1 ? 1 : 0,
            unit_level_no: String(childItem.Unit_Level_No || ''),
            status: true,
          },
        });
      }
    }

    return { count: resolvedItems.length };
  },

  // ── Filter data by page type ─────────────────────────────────────────────
  async filterData(model: Record<string, unknown>, pageId: number) {
    const where = buildFilterWhere(model, pageId);
    const data = await prisma.pPVCTransaction.findMany({
      where,
      include: {
        project: true,
        module: true,
        activity: true,
        sub_activity: true,
        component: true,
        team: true,
      },
      orderBy: [{ level_id: 'asc' }, { id: 'asc' }],
    });
    return data;
  },

  // ── Gantt Chart data ─────────────────────────────────────────────────────
  async filterGanttData(model: Record<string, unknown>) {
    const where: Record<string, unknown> = { deleted_at: null, level_id: { not: 3 } };

    if (model.project_id || model.Project_id) where.project_id = Number(model.project_id || model.Project_id);
    if (model.activity_id || model.Activity_id) where.activity_id = Number(model.activity_id || model.Activity_id);
    if (model.team_id || model.Team_id) where.team_id = Number(model.team_id || model.Team_id);
    if (model.module_id || model.Module_id) where.module_id = Number(model.module_id || model.Module_id);

    const startDate = model.start_date || model.StartDate;
    const endDate = model.end_date || model.EndDate;
    if (startDate && endDate) {
      where.start_date = { gte: new Date(String(startDate)) };
      where.end_date = { lte: new Date(String(endDate)) };
    }

    const transactions = await prisma.pPVCTransaction.findMany({
      where: where as Parameters<typeof prisma.pPVCTransaction.findMany>[0]['where'],
      include: { project: true, module: true, activity: true, component: true, team: true },
      orderBy: [{ level_id: 'asc' }, { id: 'asc' }],
    });

    // Transform to Gantt format
    const ganttData = transactions.map((t, idx) => ({
      id: t.id,
      pID: idx + 1,
      pName: t.activity?.name || t.module?.name || '',
      pStart: t.start_date ? t.start_date.toISOString().split('T')[0] : '',
      pEnd: t.end_date ? t.end_date.toISOString().split('T')[0] : '',
      pClass: t.level_id === 1 ? 'gtaskred' : 'gtaskblue',
      pLink: '',
      pMile: 0,
      pRes: t.team?.name || '',
      pComp: parseInt(t.complete_percent || '0'),
      pGroup: t.level_id === 1 ? 1 : 0,
      pParent: 0,
      pOpen: 1,
      pDepend: '',
      pCaption: t.component?.name || '',
      pNotes: t.remarks || '',
    }));

    return ganttData;
  },

  // ── Pre-Casting list (activities 1,3,6) ──────────────────────────────────
  async getPreCastingList() {
    return prisma.pPVCTransaction.findMany({
      where: {
        activity_id: { in: PRE_CASTING_ACTIVITY_IDS },
        deleted_at: null,
        planning_module_status: { not: 0 },
      },
      include: { project: true, module: true, activity: true, sub_activity: true, component: true, team: true },
      orderBy: { id: 'asc' },
    });
  },

  // ── Update pre-casting activity data ──────────────────────────────────────
  async updatePreCastingList(items: Record<string, unknown>[]) {
    if (!items.length) throw new AppError('No data provided', 400);

    for (const item of items.filter(i => i.SubActivity_id || i.sub_activity_id)) {
      const newRecord = {
        level_id: 3,
        project_id: Number(item.Project_id || item.project_id) || null,
        module_id: Number(item.Module_id || item.module_id) || null,
        activity_id: Number(item.Activity_id || item.activity_id) || null,
        sub_activity_id: Number(item.SubActivity_id || item.sub_activity_id) || null,
        component_id: Number(item.Component_id || item.component_id) || null,
        unit_level_no: String(item.Unit_Level_No || item.unit_level_no || ''),
        man_days: item.ManDays ? Number(item.ManDays) : null,
        team_id: Number(item.Team_id || item.team_id) || null,
        start_date: item.StartDate ? new Date(String(item.StartDate)) : null,
        end_date: item.EndDate ? new Date(String(item.EndDate)) : null,
        actual_start_date: item.ActualStartDate ? new Date(String(item.ActualStartDate)) : null,
        actual_end_date: item.ActualEndDate ? new Date(String(item.ActualEndDate)) : null,
        planning_module_status: Number(item.PlanningModule_Status || item.planning_module_status) || 0,
        status: true,
      };
      await prisma.pPVCTransaction.create({ data: newRecord });

      if (newRecord.planning_module_status === 3 && newRecord.activity_id && newRecord.module_id) {
        const percent = await updatePercentage(newRecord.activity_id, newRecord.module_id, newRecord.component_id);
        if (percent === 100) {
          await updateNextLevelStatus(newRecord.activity_id, newRecord.module_id, newRecord.component_id, newRecord.activity_id + 1);
        }
      }
    }
  },

  // ── QC Checklist list (activities 2,4,7) ─────────────────────────────────
  async getQcCheckList() {
    return prisma.pPVCTransaction.findMany({
      where: {
        activity_id: { in: QC_ACTIVITY_IDS },
        deleted_at: null,
        planning_module_status: { not: 0 },
      },
      include: { project: true, module: true, activity: true, sub_activity: true, component: true, team: true },
      orderBy: { id: 'asc' },
    });
  },

  // ── Update QC checklist ────────────────────────────────────────────────────
  async updateQcCheckList(items: Record<string, unknown>[]) {
    if (!items.length) throw new AppError('No data provided', 400);

    for (const item of items.filter(i => i.SubActivity_id || i.sub_activity_id)) {
      const newRecord = {
        level_id: 3,
        project_id: Number(item.Project_id || item.project_id) || null,
        module_id: Number(item.Module_id || item.module_id) || null,
        activity_id: Number(item.Activity_id || item.activity_id) || null,
        sub_activity_id: Number(item.SubActivity_id || item.sub_activity_id) || null,
        component_id: Number(item.Component_id || item.component_id) || null,
        unit_level_no: String(item.Unit_Level_No || item.unit_level_no || ''),
        man_days: item.ManDays ? Number(item.ManDays) : null,
        team_id: Number(item.Team_id || item.team_id) || null,
        start_date: item.StartDate ? new Date(String(item.StartDate)) : null,
        end_date: item.EndDate ? new Date(String(item.EndDate)) : null,
        actual_start_date: item.ActualStartDate ? new Date(String(item.ActualStartDate)) : null,
        actual_end_date: item.ActualEndDate ? new Date(String(item.ActualEndDate)) : null,
        expected_result: String(item.ExpertedResult || item.expected_result || ''),
        actual_result: String(item.ActualResult || item.actual_result || ''),
        defect_remarks: String(item.DefectRemarks || item.defect_remarks || ''),
        reassign_to: item.Reassignto ? Number(item.Reassignto) : null,
        planning_module_status: Number(item.PlanningModule_Status || item.planning_module_status) || 0,
        status: true,
      };
      await prisma.pPVCTransaction.create({ data: newRecord });

      if (newRecord.planning_module_status === 4 && newRecord.activity_id && newRecord.module_id) {
        const percent = await updatePercentage(newRecord.activity_id, newRecord.module_id, newRecord.component_id);
        if (percent === 100) {
          await updateNextLevelStatus(newRecord.activity_id, newRecord.module_id, newRecord.component_id, newRecord.activity_id + 1);
        }
      }
    }
  },

  // ── Delivery list (activity 5) ─────────────────────────────────────────────
  async getDeliveryList() {
    return prisma.pPVCTransaction.findMany({
      where: {
        activity_id: DELIVERY_ACTIVITY_ID,
        deleted_at: null,
        planning_module_status: { not: 0 },
      },
      include: { project: true, module: true, activity: true, sub_activity: true, component: true, team: true },
      orderBy: { id: 'asc' },
    });
  },

  // ── Update delivery list ────────────────────────────────────────────────────
  async updateDeliveryList(items: Record<string, unknown>[]) {
    if (!items.length) throw new AppError('No data provided', 400);

    for (const item of items.filter(i => i.SubActivity_id || i.sub_activity_id)) {
      const newRecord = {
        level_id: 3,
        project_id: Number(item.Project_id || item.project_id) || null,
        module_id: Number(item.Module_id || item.module_id) || null,
        activity_id: Number(item.Activity_id || item.activity_id) || null,
        sub_activity_id: Number(item.SubActivity_id || item.sub_activity_id) || null,
        component_id: Number(item.Component_id || item.component_id) || null,
        unit_level_no: String(item.Unit_Level_No || item.unit_level_no || ''),
        man_days: item.ManDays ? Number(item.ManDays) : null,
        team_id: Number(item.Team_id || item.team_id) || null,
        start_date: item.StartDate ? new Date(String(item.StartDate)) : null,
        end_date: item.EndDate ? new Date(String(item.EndDate)) : null,
        actual_start_date: item.ActualStartDate ? new Date(String(item.ActualStartDate)) : null,
        actual_end_date: item.ActualEndDate ? new Date(String(item.ActualEndDate)) : null,
        target_location: String(item.TargetLocation || item.target_location || ''),
        vehicle_no: String(item.VehicleNo || item.vehicle_no || ''),
        rfid_tag: String(item.RFIDTag || item.rfid_tag || ''),
        planning_module_status: Number(item.PlanningModule_Status || item.planning_module_status) || 0,
        status: true,
      };
      await prisma.pPVCTransaction.create({ data: newRecord });

      if (newRecord.planning_module_status === 6 && newRecord.activity_id && newRecord.module_id) {
        const percent = await updatePercentage(newRecord.activity_id, newRecord.module_id, newRecord.component_id);
        if (percent === 100) {
          await updateNextLevelStatus(newRecord.activity_id, newRecord.module_id, newRecord.component_id, newRecord.activity_id + 1);
        }
      }
    }
  },

  // ── Asset Tracking Summary ─────────────────────────────────────────────────
  async getAssetTrackingSummary(filters: Record<string, unknown>) {
    const where: Record<string, unknown> = { deleted_at: null };
    if (filters.project_id) where.project_id = Number(filters.project_id);
    if (filters.module_id) where.module_id = Number(filters.module_id);

    return prisma.pPVCTransaction.findMany({
      where: where as Parameters<typeof prisma.pPVCTransaction.findMany>[0]['where'],
      include: { project: true, module: true, activity: true, component: true, team: true },
      orderBy: [{ project_id: 'asc' }, { module_id: 'asc' }, { level_id: 'asc' }],
    });
  },

  // ── Module Status list ─────────────────────────────────────────────────────
  async getModuleStatusList() {
    return [
      { id: 0, Name: 'Not Started' },
      { id: 1, Name: 'Planned' },
      { id: 2, Name: 'In Progress' },
      { id: 3, Name: 'Pre-Casting Complete' },
      { id: 4, Name: 'QC Passed' },
      { id: 5, Name: 'Ready For Delivery' },
      { id: 6, Name: 'Delivered' },
      { id: 7, Name: 'Installed' },
      { id: 8, Name: 'Unlocked (Next)' },
    ];
  },
};
