import {
  projectDao,
  activityDao,
  teamDao,
  materialDao,
  unitDao,
  moduleDao,
  componentDao,
  blockDao,
  countryDao,
  checkListDao,
  userDao,
} from '../dao/generic.dao';
import { AppError } from '../middlewares/error.middleware';
import bcrypt from 'bcryptjs';

// ── Project Service ──────────────────────────────────────────────────────────
export const projectService = {
  async getAll() {
    return projectDao.findAll();
  },
  async getById(id: number) {
    const item = await projectDao.findById(id);
    if (!item) throw new AppError('Project not found', 404);
    return item;
  },
  async saveOrUpdate(data: Record<string, unknown>) {
    const { id, ...rest } = data;
    if (id && Number(id) > 0) {
      return { ...(await projectDao.update(Number(id), rest)), updated: true };
    }
    return { ...(await projectDao.create(rest)), updated: false };
  },
  async delete(id: number) {
    await projectDao.softDelete(id);
  },
  async importMany(items: Record<string, unknown>[]) {
    const results = [];
    for (const item of items) {
      results.push(await projectDao.create(item));
    }
    return results;
  },
};

// ── Activity Service ─────────────────────────────────────────────────────────
export const activityService = {
  async getAll() {
    return activityDao.findAll({}, { parent_activity: true, sub_activities: true });
  },
  async getById(id: number) {
    const item = await activityDao.findById(id, { parent_activity: true });
    if (!item) throw new AppError('Activity not found', 404);
    return item;
  },
  async getParentActivityList() {
    return activityDao.findAll({ parent_activity_id: null }, {});
  },
  async getParentActivityPreCastList() {
    // Activities used in pre-casting (id 1,3,6)
    return activityDao.findAll({ parent_activity_id: null, status: true });
  },
  async getSubParentActivityList(parentId: number) {
    return activityDao.findAll({ parent_activity_id: parentId });
  },
  async saveOrUpdate(data: Record<string, unknown>) {
    const { id, ...rest } = data;
    if (id && Number(id) > 0) {
      return { ...(await activityDao.update(Number(id), rest)), updated: true };
    }
    return { ...(await activityDao.create(rest)), updated: false };
  },
  async delete(id: number) {
    await activityDao.softDelete(id);
  },
};

// ── Team Service ─────────────────────────────────────────────────────────────
export const teamService = {
  async getAll() {
    return teamDao.findAll();
  },
  async getById(id: number) {
    const item = await teamDao.findById(id);
    if (!item) throw new AppError('Team not found', 404);
    return item;
  },
  async saveOrUpdate(data: Record<string, unknown>) {
    const { id, ...rest } = data;
    if (id && Number(id) > 0) {
      return { ...(await teamDao.update(Number(id), rest)), updated: true };
    }
    return { ...(await teamDao.create(rest)), updated: false };
  },
  async delete(id: number) {
    await teamDao.softDelete(id);
  },
};

// ── Material Service ─────────────────────────────────────────────────────────
export const materialService = {
  async getAll() {
    return materialDao.findAll();
  },
  async getById(id: number) {
    const item = await materialDao.findById(id);
    if (!item) throw new AppError('Material not found', 404);
    return item;
  },
  async saveOrUpdate(data: Record<string, unknown>) {
    const { id, ...rest } = data;
    if (id && Number(id) > 0) {
      return { ...(await materialDao.update(Number(id), rest)), updated: true };
    }
    return { ...(await materialDao.create(rest)), updated: false };
  },
  async delete(id: number) {
    await materialDao.softDelete(id);
  },
};

// ── Unit Service ─────────────────────────────────────────────────────────────
export const unitService = {
  async getAll() {
    return unitDao.findAll();
  },
  async getById(id: number) {
    const item = await unitDao.findById(id);
    if (!item) throw new AppError('Unit not found', 404);
    return item;
  },
  async saveOrUpdate(data: Record<string, unknown>) {
    const { id, ...rest } = data;
    if (id && Number(id) > 0) {
      return { ...(await unitDao.update(Number(id), rest)), updated: true };
    }
    return { ...(await unitDao.create(rest)), updated: false };
  },
  async delete(id: number) {
    await unitDao.softDelete(id);
  },
};

// ── Module Service ───────────────────────────────────────────────────────────
export const ppvcModuleService = {
  async getAll() {
    return moduleDao.findAll({}, { unit: true });
  },
  async getById(id: number) {
    const item = await moduleDao.findById(id, { unit: true });
    if (!item) throw new AppError('Module not found', 404);
    return item;
  },
  async saveOrUpdate(data: Record<string, unknown>) {
    const { id, ...rest } = data;
    if (id && Number(id) > 0) {
      return { ...(await moduleDao.update(Number(id), rest)), updated: true };
    }
    return { ...(await moduleDao.create(rest)), updated: false };
  },
  async delete(id: number) {
    await moduleDao.softDelete(id);
  },
};

// ── Component Service ────────────────────────────────────────────────────────
export const ppvcComponentService = {
  async getAll() {
    return componentDao.findAll({}, { module: true, material: true });
  },
  async getById(id: number) {
    const item = await componentDao.findById(id, { module: true, material: true });
    if (!item) throw new AppError('Component not found', 404);
    return item;
  },
  async saveOrUpdate(data: Record<string, unknown>) {
    const { id, ...rest } = data;
    if (id && Number(id) > 0) {
      return { ...(await componentDao.update(Number(id), rest)), updated: true };
    }
    return { ...(await componentDao.create(rest)), updated: false };
  },
  async delete(id: number) {
    await componentDao.softDelete(id);
  },
};

// ── Block Service ────────────────────────────────────────────────────────────
export const blockService = {
  async getAll() {
    return blockDao.findAll();
  },
  async getById(id: number) {
    const item = await blockDao.findById(id);
    if (!item) throw new AppError('Block not found', 404);
    return item;
  },
  async saveOrUpdate(data: Record<string, unknown>) {
    const { id, ...rest } = data;
    if (id && Number(id) > 0) {
      return { ...(await blockDao.update(Number(id), rest)), updated: true };
    }
    return { ...(await blockDao.create(rest)), updated: false };
  },
  async delete(id: number) {
    await blockDao.softDelete(id);
  },
};

// ── Country Service ──────────────────────────────────────────────────────────
export const countryService = {
  async getAll() {
    return countryDao.findAll();
  },
  async getById(id: number) {
    const item = await countryDao.findById(id);
    if (!item) throw new AppError('Country not found', 404);
    return item;
  },
  async saveOrUpdate(data: Record<string, unknown>) {
    const { id, ...rest } = data;
    if (id && Number(id) > 0) {
      return { ...(await countryDao.update(Number(id), rest)), updated: true };
    }
    return { ...(await countryDao.create(rest)), updated: false };
  },
  async delete(id: number) {
    await countryDao.softDelete(id);
  },
};

// ── CheckList Service ────────────────────────────────────────────────────────
export const checkListService = {
  async getAll() {
    return checkListDao.findAll();
  },
  async saveOrUpdate(data: Record<string, unknown>) {
    const { id, ...rest } = data;
    if (id && Number(id) > 0) {
      return { ...(await checkListDao.update(Number(id), rest)), updated: true };
    }
    return { ...(await checkListDao.create(rest)), updated: false };
  },
  async delete(id: number) {
    await checkListDao.softDelete(id);
  },
};

// ── User Service ─────────────────────────────────────────────────────────────
export const userService = {
  async getAll() {
    return userDao.findAll({}, {}, { id: 'asc' });
  },
  async getById(id: number) {
    const item = await userDao.findById(id);
    if (!item) throw new AppError('User not found', 404);
    return item;
  },
  async saveOrUpdate(data: Record<string, unknown>) {
    const { id, password, ...rest } = data;
    if (password) {
      (rest as Record<string, unknown>).password_hash = await bcrypt.hash(String(password), 10);
    }
    if (id && Number(id) > 0) {
      return { ...(await userDao.update(Number(id), rest)), updated: true };
    }
    return { ...(await userDao.create(rest)), updated: false };
  },
  async delete(id: number) {
    await userDao.softDelete(id);
  },
};
