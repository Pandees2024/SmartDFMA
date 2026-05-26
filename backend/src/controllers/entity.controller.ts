import { Request, Response, NextFunction } from 'express';
import {
  projectService,
  activityService,
  teamService,
  materialService,
  unitService,
  ppvcModuleService,
  ppvcComponentService,
  blockService,
  countryService,
  checkListService,
  userService,
} from '../services/entity.service';

// ── Generic controller factory ────────────────────────────────────────────────
const createCrudController = (service: {
  getAll: () => Promise<unknown>;
  getById?: (id: number) => Promise<unknown>;
  saveOrUpdate: (data: Record<string, unknown>) => Promise<unknown>;
  delete: (id: number) => Promise<void>;
  importMany?: (items: Record<string, unknown>[]) => Promise<unknown>;
}) => ({
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await service.getAll();
      res.json(items);
    } catch (e) { next(e); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!service.getById) { res.status(404).json({}); return; }
      const item = await service.getById(parseInt(req.params.id));
      res.json(item);
    } catch (e) { next(e); }
  },

  saveOrUpdate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.saveOrUpdate(req.body) as Record<string, unknown>;
      const isUpdate = result.updated;
      res.json({
        Type: 'S',
        Message: isUpdate ? 'Updated successfully' : 'Inserted successfully',
        AdditionalData: { id: result.id },
      });
    } catch (e) { next(e); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await service.delete(parseInt(req.params.id));
      res.json({ Type: 'S', Message: 'Deleted successfully' });
    } catch (e) { next(e); }
  },

  importMany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!service.importMany) { res.status(404).json({ Type: 'E', Message: 'Import not supported' }); return; }
      const items = Array.isArray(req.body) ? req.body : [req.body];
      if (!items.length) { res.json({ Type: 'E', Message: 'No Data Found' }); return; }
      await service.importMany(items);
      res.json({ Type: 'S', Message: 'Import successful' });
    } catch (e) { next(e); }
  },
});

// ── Entity Controllers ─────────────────────────────────────────────────────
export const projectController = createCrudController(projectService);
export const teamController = createCrudController(teamService);
export const materialController = createCrudController(materialService);
export const unitController = createCrudController(unitService);
export const blockController = createCrudController(blockService);
export const countryController = createCrudController(countryService);
export const checkListController = createCrudController(checkListService);
export const userController = createCrudController(userService);

// ── Activity Controller (extended) ───────────────────────────────────────────
export const activityController = {
  ...createCrudController(activityService),

  parentActivityList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await activityService.getParentActivityList();
      res.json(items);
    } catch (e) { next(e); }
  },

  parentActivityPreCastList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await activityService.getParentActivityPreCastList();
      res.json(items);
    } catch (e) { next(e); }
  },

  subParentActivityPreCastList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = parseInt(req.params.id);
      const items = await activityService.getSubParentActivityList(parentId);
      res.json(items);
    } catch (e) { next(e); }
  },
};

// ── Module Controller (extended) ─────────────────────────────────────────────
export const ppvcModuleController = {
  ...createCrudController(ppvcModuleService),
};

// ── Component Controller (extended) ──────────────────────────────────────────
export const ppvcComponentController = {
  ...createCrudController(ppvcComponentService),
};
