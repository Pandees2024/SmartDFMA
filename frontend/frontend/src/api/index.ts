import apiClient from './client';
import {
  Project, Activity, Team, Material, Unit, PPVCModule, Component,
  Block, Country, CheckList, User, PPVCTransaction, GanttChartItem,
  FilterParams, ModuleStatus,
} from '../types';

// ── Generic API response handler ──────────────────────────────────────────────
const extractData = (response: { data: unknown }) => response.data;

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (credentials: { Username: string; Password: string }) =>
    apiClient.post('/UserApi/Authorization', credentials).then(extractData),
  logout: () => apiClient.post('/auth/logout').then(extractData),
  me: () => apiClient.get('/auth/me').then(extractData),
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }).then(extractData),
};

// ── Project API ───────────────────────────────────────────────────────────────
export const projectApi = {
  getAll: () => apiClient.get<Project[]>('/ProjectApi/List').then(r => r.data),
  getById: (id: number) => apiClient.get<Project>(`/ProjectApi/GetById/${id}`).then(r => r.data),
  saveOrUpdate: (data: Partial<Project>) => apiClient.post('/ProjectApi/SaveOrUpdate', data).then(r => r.data),
  delete: (id: number) => apiClient.get(`/ProjectApi/Delete/${id}`).then(r => r.data),
  importMany: (items: Partial<Project>[]) => apiClient.post('/ProjectApi/ImportProject', items).then(r => r.data),
};

// ── Activity API ──────────────────────────────────────────────────────────────
export const activityApi = {
  getAll: () => apiClient.get<Activity[]>('/ActivityApi/List').then(r => r.data),
  getById: (id: number) => apiClient.get<Activity>(`/ActivityApi/GetById/${id}`).then(r => r.data),
  saveOrUpdate: (data: Partial<Activity>) => apiClient.post('/ActivityApi/SaveOrUpdate', data).then(r => r.data),
  delete: (id: number) => apiClient.get(`/ActivityApi/Delete/${id}`).then(r => r.data),
  getParentList: () => apiClient.get<Activity[]>('/ActivityApi/ParentActivityList').then(r => r.data),
  getParentPreCastList: () => apiClient.get<Activity[]>('/ActivityApi/ParentActivityPreCastList').then(r => r.data),
  getSubParentList: (id: number) => apiClient.get<Activity[]>(`/ActivityApi/SubParentActivityPreCastList/${id}`).then(r => r.data),
};

// ── Team API ──────────────────────────────────────────────────────────────────
export const teamApi = {
  getAll: () => apiClient.get<Team[]>('/TeamApi/List').then(r => r.data),
  getById: (id: number) => apiClient.get<Team>(`/TeamApi/GetById/${id}`).then(r => r.data),
  saveOrUpdate: (data: Partial<Team>) => apiClient.post('/TeamApi/SaveOrUpdate', data).then(r => r.data),
  delete: (id: number) => apiClient.get(`/TeamApi/Delete/${id}`).then(r => r.data),
};

// ── Material API ──────────────────────────────────────────────────────────────
export const materialApi = {
  getAll: () => apiClient.get<Material[]>('/MaterialApi/List').then(r => r.data),
  getById: (id: number) => apiClient.get<Material>(`/MaterialApi/GetById/${id}`).then(r => r.data),
  saveOrUpdate: (data: Partial<Material>) => apiClient.post('/MaterialApi/SaveOrUpdate', data).then(r => r.data),
  delete: (id: number) => apiClient.get(`/MaterialApi/Delete/${id}`).then(r => r.data),
};

// ── Unit API ──────────────────────────────────────────────────────────────────
export const unitApi = {
  getAll: () => apiClient.get<Unit[]>('/UnitApi/List').then(r => r.data),
  getById: (id: number) => apiClient.get<Unit>(`/UnitApi/GetById/${id}`).then(r => r.data),
  saveOrUpdate: (data: Partial<Unit>) => apiClient.post('/UnitApi/SaveOrUpdate', data).then(r => r.data),
  delete: (id: number) => apiClient.get(`/UnitApi/Delete/${id}`).then(r => r.data),
};

// ── Module API ────────────────────────────────────────────────────────────────
export const moduleApi = {
  getAll: () => apiClient.get<PPVCModule[]>('/ModuleApi/List').then(r => r.data),
  getById: (id: number) => apiClient.get<PPVCModule>(`/ModuleApi/GetById/${id}`).then(r => r.data),
  saveOrUpdate: (data: Partial<PPVCModule>) => apiClient.post('/ModuleApi/SaveOrUpdate', data).then(r => r.data),
  delete: (id: number) => apiClient.get(`/ModuleApi/Delete/${id}`).then(r => r.data),
};

// ── Component API ─────────────────────────────────────────────────────────────
export const componentApi = {
  getAll: () => apiClient.get<Component[]>('/ComponentApi/List').then(r => r.data),
  getById: (id: number) => apiClient.get<Component>(`/ComponentApi/GetById/${id}`).then(r => r.data),
  saveOrUpdate: (data: Partial<Component>) => apiClient.post('/ComponentApi/SaveOrUpdate', data).then(r => r.data),
  delete: (id: number) => apiClient.get(`/ComponentApi/Delete/${id}`).then(r => r.data),
};

// ── Block API ─────────────────────────────────────────────────────────────────
export const blockApi = {
  getAll: () => apiClient.get<Block[]>('/BlockApi/List').then(r => r.data),
  saveOrUpdate: (data: Partial<Block>) => apiClient.post('/BlockApi/SaveOrUpdate', data).then(r => r.data),
  delete: (id: number) => apiClient.get(`/BlockApi/Delete/${id}`).then(r => r.data),
};

// ── Country API ───────────────────────────────────────────────────────────────
export const countryApi = {
  getAll: () => apiClient.get<Country[]>('/CountryApi/List').then(r => r.data),
  saveOrUpdate: (data: Partial<Country>) => apiClient.post('/CountryApi/SaveOrUpdate', data).then(r => r.data),
  delete: (id: number) => apiClient.get(`/CountryApi/Delete/${id}`).then(r => r.data),
};

// ── CheckList API ─────────────────────────────────────────────────────────────
export const checkListApi = {
  getAll: () => apiClient.get<CheckList[]>('/CheckListApi/List').then(r => r.data),
  saveOrUpdate: (data: Partial<CheckList>) => apiClient.post('/CheckListApi/SaveOrUpdate', data).then(r => r.data),
};

// ── User API ──────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: () => apiClient.get<User[]>('/UserApi/List').then(r => r.data),
  getById: (id: number) => apiClient.get<User>(`/UserApi/GetById/${id}`).then(r => r.data),
  saveOrUpdate: (data: Partial<User> & { password?: string }) => apiClient.post('/UserApi/SaveOrUpdate', data).then(r => r.data),
  delete: (id: number) => apiClient.get(`/UserApi/Delete/${id}`).then(r => r.data),
};

// ── PPVC Transaction API ──────────────────────────────────────────────────────
export const ppvcTransactionApi = {
  getAll: () => apiClient.get<PPVCTransaction[]>('/PPVCTransactionApi/List').then(r => r.data),
  getById: (id: number) => apiClient.get<PPVCTransaction>(`/PPVCTransactionApi/GetById/${id}`).then(r => r.data),
  saveOrUpdate: (data: Partial<PPVCTransaction>) => apiClient.post('/PPVCTransactionApi/SaveOrUpdate', data).then(r => r.data),
  delete: (id: number) => apiClient.get(`/PPVCTransactionApi/Delete/${id}`).then(r => r.data),
  importMany: (items: Partial<PPVCTransaction>[]) => apiClient.post('/PPVCTransactionApi/ImportPPVCTransaction', items).then(r => r.data),
  filterData: (model: FilterParams, pageId: number) => apiClient.post(`/PPVCTransactionApi/FilterData/${pageId}`, model).then(r => r.data),
  filterGanttData: (model: FilterParams) => apiClient.post<{ Type: string; AdditionalData: { model: GanttChartItem[] } }>('/PPVCTransactionApi/FilterGanttChatData', model).then(r => r.data),
  getPreCastingList: () => apiClient.get<PPVCTransaction[]>('/PPVCTransactionApi/PreCastingList').then(r => r.data),
  updatePreCasting: (items: PPVCTransaction[]) => apiClient.post('/PPVCTransactionApi/PreCastingListUpdate', items).then(r => r.data),
  getQcCheckList: () => apiClient.get<PPVCTransaction[]>('/PPVCTransactionApi/QcCheckList').then(r => r.data),
  updateQcCheckList: (items: PPVCTransaction[]) => apiClient.post('/PPVCTransactionApi/QCCheckListUpdate', items).then(r => r.data),
  getDeliveryList: () => apiClient.get<PPVCTransaction[]>('/PPVCTransactionApi/DeliveryList').then(r => r.data),
  updateDeliveryList: (items: PPVCTransaction[]) => apiClient.post('/PPVCTransactionApi/DeliveryListUpdate', items).then(r => r.data),
  getAssetTracking: () => apiClient.get<PPVCTransaction[]>('/PPVCTransactionApi/AssertTracking').then(r => r.data),
};

// ── Module Status API ─────────────────────────────────────────────────────────
export const moduleStatusApi = {
  getActivityStatusList: () => apiClient.get<ModuleStatus[]>('/ModuleStatusApi/ActivtyStatusList').then(r => r.data),
};
