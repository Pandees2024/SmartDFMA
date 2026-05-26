// ── Base Types ────────────────────────────────────────────────────────────────
export interface BaseModel {
  id: number;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  Type?: 'S' | 'E';
  Message?: string;
  AdditionalData?: Record<string, unknown>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Auth Types ────────────────────────────────────────────────────────────────
export interface User extends BaseModel {
  username: string;
  Username?: string;
  name?: string;
  Name?: string;
  email?: string;
  role: string;
  team_id?: number;
  is_leader?: boolean;
  landing_page?: string;
  Token?: string;
  api_token?: string;
}

export interface LoginCredentials {
  Username: string;
  Password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// ── Entity Types ──────────────────────────────────────────────────────────────
export interface Project extends BaseModel {
  name: string;
  Name?: string;
  code?: string;
  client_name?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  model_reference?: string;
  model_ref_location?: string;
}

export interface Activity extends BaseModel {
  name: string;
  Name?: string;
  code?: string;
  parent_activity_id?: number | null;
  parent_activity?: Activity;
  sub_activities?: Activity[];
}

export interface Team extends BaseModel {
  name?: string;
  Name?: string;
  code?: string;
  activity?: string;
  remarks?: string;
}

export interface Material extends BaseModel {
  name: string;
  Name?: string;
  code?: string;
}

export interface Unit extends BaseModel {
  name: string;
  Name?: string;
  code?: string;
}

export interface PPVCModule extends BaseModel {
  name: string;
  Name?: string;
  code?: string;
  Code?: string;
  short_description?: string;
  description?: string;
  module_type?: string;
  unit_id?: number | null;
  unit?: Unit;
}

export interface Component extends BaseModel {
  name: string;
  Name?: string;
  code?: string;
  Code?: string;
  module_id?: number | null;
  material_id?: number | null;
  rfid?: string;
  dimension?: string;
  remarks?: string;
  Remarks?: string;
  module?: PPVCModule;
  material?: Material;
}

export interface Block extends BaseModel {
  name: string;
  code?: string;
}

export interface Country extends BaseModel {
  name: string;
  code?: string;
}

export interface CheckList extends BaseModel {
  name: string;
}

// ── PPVC Transaction Type ─────────────────────────────────────────────────────
export interface PPVCTransaction extends BaseModel {
  project_id?: number | null;
  Project_id?: number | null;
  module_id?: number | null;
  Module_id?: number | null;
  activity_id?: number | null;
  Activity_id?: number | null;
  sub_activity_id?: number | null;
  SubActivity_id?: number | null;
  component_id?: number | null;
  Component_id?: number | null;
  man_days?: number | null;
  ManDays?: number | null;
  team_id?: number | null;
  Team_id?: number | null;
  start_date?: string | null;
  StartDate?: string | null;
  end_date?: string | null;
  EndDate?: string | null;
  dependency?: number | null;
  Dependency?: number | null;
  lead_time?: number | null;
  LeadTime?: number | null;
  complete_percent?: string;
  CompletePercent?: string;
  planning_module_status?: number;
  PlanningModule_Status?: number;
  actual_start_date?: string | null;
  ActualStartDate?: string | null;
  actual_end_date?: string | null;
  ActualEndDate?: string | null;
  remarks?: string;
  Remarks?: string;
  level_id?: number;
  Level_id?: number;
  unit_level_no?: string;
  Unit_Level_No?: string;

  // QC fields
  expected_result?: string;
  ExpertedResult?: string;
  actual_result?: string;
  ActualResult?: string;
  defect_remarks?: string;
  DefectRemarks?: string;
  reassign_to?: number | null;
  Reassignto?: number | null;

  // Delivery fields
  target_location?: string;
  TargetLocation?: string;
  vehicle_no?: string;
  VehicleNo?: string;
  rfid_tag?: string;
  RFIDTag?: string;

  // Relations (populated)
  project?: Project;
  module?: PPVCModule;
  activity?: Activity;
  sub_activity?: Activity;
  component?: Component;
  team?: Team;

  // Excel import helpers
  ProjectName?: string;
  ModuleName?: string;
  ActivityName?: string;
  SubActivityName?: string;
  ComponentName?: string;
  TeamName?: string;
}

// ── Gantt Chart Types ─────────────────────────────────────────────────────────
export interface GanttChartItem {
  id: number;
  pID: number;
  pName: string;
  pStart: string;
  pEnd: string;
  pClass: string;
  pLink: string;
  pMile: number;
  pRes: string;
  pComp: number;
  pGroup: number;
  pParent: number;
  pOpen: number;
  pDepend: string;
  pCaption: string;
  pNotes: string;
}

// ── Filter Types ──────────────────────────────────────────────────────────────
export interface FilterParams {
  project_id?: number | null;
  Project_id?: number | null;
  module_id?: number | null;
  Module_id?: number | null;
  activity_id?: number | null;
  Activity_id?: number | null;
  team_id?: number | null;
  Team_id?: number | null;
  start_date?: string | null;
  StartDate?: string | null;
  end_date?: string | null;
  EndDate?: string | null;
}

// ── Status Types ──────────────────────────────────────────────────────────────
export interface ModuleStatus {
  id: number;
  Name: string;
}

export const MODULE_STATUS_LABELS: Record<number, string> = {
  0: 'Not Started',
  1: 'Planned',
  2: 'In Progress',
  3: 'Pre-Cast Done',
  4: 'QC Passed',
  5: 'Ready for Delivery',
  6: 'Delivered',
  7: 'Installed',
  8: 'Unlocked',
};

export const MODULE_STATUS_COLORS: Record<number, string> = {
  0: 'default',
  1: 'blue',
  2: 'orange',
  3: 'cyan',
  4: 'green',
  5: 'purple',
  6: 'gold',
  7: 'lime',
  8: 'volcano',
};
