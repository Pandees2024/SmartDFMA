import { Router } from 'express';
import {
  projectController,
  activityController,
  teamController,
  materialController,
  unitController,
  ppvcModuleController,
  ppvcComponentController,
  blockController,
  countryController,
  checkListController,
  userController,
} from '../../controllers/entity.controller';

const router = Router();

// ── Project API (matching original: ProjectApi/List, GetById, SaveOrUpdate, Delete) ──
router.get('/ProjectApi/List', projectController.list);
router.get('/ProjectApi/GetById/:id', projectController.getById);
router.post('/ProjectApi/SaveOrUpdate', projectController.saveOrUpdate);
router.get('/ProjectApi/Delete/:id', projectController.delete);
router.post('/ProjectApi/ImportProject', projectController.importMany);
// Modern REST
router.get('/projects', projectController.list);
router.get('/projects/:id', projectController.getById);
router.post('/projects', projectController.saveOrUpdate);
router.delete('/projects/:id', projectController.delete);

// ── Activity API ─────────────────────────────────────────────────────────────
router.get('/ActivityApi/List', activityController.list);
router.get('/ActivityApi/GetById/:id', activityController.getById);
router.post('/ActivityApi/SaveOrUpdate', activityController.saveOrUpdate);
router.get('/ActivityApi/Delete/:id', activityController.delete);
router.get('/ActivityApi/ParentActivityList', activityController.parentActivityList);
router.get('/ActivityApi/ParentActivityPreCastList', activityController.parentActivityPreCastList);
router.get('/ActivityApi/SubParentActivityPreCastList/:id', activityController.subParentActivityPreCastList);
// Modern REST
router.get('/activities', activityController.list);
router.get('/activities/parents', activityController.parentActivityList);
router.get('/activities/precast', activityController.parentActivityPreCastList);
router.get('/activities/subprecast/:id', activityController.subParentActivityPreCastList);
router.get('/activities/:id', activityController.getById);
router.post('/activities', activityController.saveOrUpdate);
router.delete('/activities/:id', activityController.delete);

// ── Team API ─────────────────────────────────────────────────────────────────
router.get('/TeamApi/List', teamController.list);
router.get('/TeamApi/GetById/:id', teamController.getById);
router.post('/TeamApi/SaveOrUpdate', teamController.saveOrUpdate);
router.get('/TeamApi/Delete/:id', teamController.delete);
router.get('/teams', teamController.list);
router.get('/teams/:id', teamController.getById);
router.post('/teams', teamController.saveOrUpdate);
router.delete('/teams/:id', teamController.delete);

// ── Material API ─────────────────────────────────────────────────────────────
router.get('/MaterialApi/List', materialController.list);
router.get('/MaterialApi/GetById/:id', materialController.getById);
router.post('/MaterialApi/SaveOrUpdate', materialController.saveOrUpdate);
router.get('/MaterialApi/Delete/:id', materialController.delete);
router.get('/materials', materialController.list);
router.get('/materials/:id', materialController.getById);
router.post('/materials', materialController.saveOrUpdate);
router.delete('/materials/:id', materialController.delete);

// ── Unit API ─────────────────────────────────────────────────────────────────
router.get('/UnitApi/List', unitController.list);
router.get('/UnitApi/GetById/:id', unitController.getById);
router.post('/UnitApi/SaveOrUpdate', unitController.saveOrUpdate);
router.get('/UnitApi/Delete/:id', unitController.delete);
router.get('/units', unitController.list);
router.get('/units/:id', unitController.getById);
router.post('/units', unitController.saveOrUpdate);
router.delete('/units/:id', unitController.delete);

// ── Module API ───────────────────────────────────────────────────────────────
router.get('/ModuleApi/List', ppvcModuleController.list);
router.get('/ModuleApi/GetById/:id', ppvcModuleController.getById);
router.post('/ModuleApi/SaveOrUpdate', ppvcModuleController.saveOrUpdate);
router.get('/ModuleApi/Delete/:id', ppvcModuleController.delete);
router.get('/modules', ppvcModuleController.list);
router.get('/modules/:id', ppvcModuleController.getById);
router.post('/modules', ppvcModuleController.saveOrUpdate);
router.delete('/modules/:id', ppvcModuleController.delete);

// ── Component API ────────────────────────────────────────────────────────────
router.get('/ComponentApi/List', ppvcComponentController.list);
router.get('/ComponentApi/GetById/:id', ppvcComponentController.getById);
router.post('/ComponentApi/SaveOrUpdate', ppvcComponentController.saveOrUpdate);
router.get('/ComponentApi/Delete/:id', ppvcComponentController.delete);
router.get('/components', ppvcComponentController.list);
router.get('/components/:id', ppvcComponentController.getById);
router.post('/components', ppvcComponentController.saveOrUpdate);
router.delete('/components/:id', ppvcComponentController.delete);

// ── Block API ────────────────────────────────────────────────────────────────
router.get('/BlockApi/List', blockController.list);
router.post('/BlockApi/SaveOrUpdate', blockController.saveOrUpdate);
router.get('/BlockApi/Delete/:id', blockController.delete);
router.get('/blocks', blockController.list);
router.post('/blocks', blockController.saveOrUpdate);
router.delete('/blocks/:id', blockController.delete);

// ── Country API ──────────────────────────────────────────────────────────────
router.get('/CountryApi/List', countryController.list);
router.post('/CountryApi/SaveOrUpdate', countryController.saveOrUpdate);
router.get('/CountryApi/Delete/:id', countryController.delete);
router.get('/countries', countryController.list);
router.post('/countries', countryController.saveOrUpdate);
router.delete('/countries/:id', countryController.delete);

// ── CheckList API ────────────────────────────────────────────────────────────
router.get('/CheckListApi/List', checkListController.list);
router.post('/CheckListApi/SaveOrUpdate', checkListController.saveOrUpdate);
router.get('/checklists', checkListController.list);
router.post('/checklists', checkListController.saveOrUpdate);

// ── User API ─────────────────────────────────────────────────────────────────
router.get('/UserApi/List', userController.list);
router.get('/UserApi/GetById/:id', userController.getById);
router.post('/UserApi/SaveOrUpdate', userController.saveOrUpdate);
router.get('/UserApi/Delete/:id', userController.delete);
router.get('/users', userController.list);
router.get('/users/:id', userController.getById);
router.post('/users', userController.saveOrUpdate);
router.delete('/users/:id', userController.delete);

export default router;
