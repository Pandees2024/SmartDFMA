import { Request, Response, NextFunction } from 'express';
import { ppvcTransactionService } from '../services/ppvc-transaction.service';

export const ppvcTransactionController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await ppvcTransactionService.getAll();
      res.json(items);
    } catch (e) { next(e); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await ppvcTransactionService.getById(parseInt(req.params.id));
      res.json(item);
    } catch (e) { next(e); }
  },

  saveOrUpdate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ppvcTransactionService.saveOrUpdate(req.body) as Record<string, unknown>;
      const isUpdate = result.updated;
      res.json({
        Type: 'S',
        Message: isUpdate ? 'PPVCTransaction Updated successfully' : 'PPVCTransaction inserted successfully',
        AdditionalData: { id: result.id },
      });
    } catch (e) { next(e); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ppvcTransactionService.delete(parseInt(req.params.id));
      res.json({ Type: 'S', Message: 'PPVCTransaction Deleted successfully' });
    } catch (e) { next(e); }
  },

  importPPVCTransaction: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      if (!items.length) { res.json({ Type: 'E', Message: 'No Data Found' }); return; }
      const result = await ppvcTransactionService.importPPVCTransaction(items);
      res.json({ Type: 'S', Message: 'PPVCTransaction import successfully', AdditionalData: result });
    } catch (e) { next(e); }
  },

  filterData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pageId = parseInt(req.params.pageid) || 1;
      const data = await ppvcTransactionService.filterData(req.body, pageId);
      if (data.length > 0) {
        res.json({ Type: 'S', Message: 'Success', AdditionalData: { model: data } });
      } else {
        res.json({ Type: 'E', Message: 'No Data Found', AdditionalData: { model: [] } });
      }
    } catch (e) { next(e); }
  },

  filterGanttChatData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model = req.method === 'POST' ? req.body : {};
      const data = await ppvcTransactionService.filterGanttData(model);
      if (data.length > 0) {
        res.json({ Type: 'S', Message: 'Success', AdditionalData: { model: data } });
      } else {
        const empty = [{ id: 1, pID: 1, pName: '', pStart: '', pEnd: '', pClass: '', pLink: '', pMile: 0, pRes: '', pComp: 0, pGroup: 0, pParent: 0, pOpen: 0, pDepend: '', pCaption: '', pNotes: '' }];
        res.json({ Type: 'E', Message: 'No Data Found', AdditionalData: { model: empty } });
      }
    } catch (e) { next(e); }
  },

  precastingList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await ppvcTransactionService.getPreCastingList();
      res.json(items);
    } catch (e) { next(e); }
  },

  precastingListUpdate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      if (!items.length) { res.json({ Type: 'E', Message: 'No Data Found' }); return; }
      await ppvcTransactionService.updatePreCastingList(items);
      res.json({ Type: 'S', Message: 'PPVCTransactionList Updated successfully' });
    } catch (e) { next(e); }
  },

  qcCheckList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await ppvcTransactionService.getQcCheckList();
      res.json(items);
    } catch (e) { next(e); }
  },

  qcCheckListUpdate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      if (!items.length) { res.json({ Type: 'E', Message: 'No Data Found' }); return; }
      await ppvcTransactionService.updateQcCheckList(items);
      res.json({ Type: 'S', Message: 'PPVCTransactionList Updated successfully' });
    } catch (e) { next(e); }
  },

  deliveryList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await ppvcTransactionService.getDeliveryList();
      res.json(items);
    } catch (e) { next(e); }
  },

  deliveryListUpdate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      if (!items.length) { res.json({ Type: 'E', Message: 'No Data Found' }); return; }
      await ppvcTransactionService.updateDeliveryList(items);
      res.json({ Type: 'S', Message: 'PPVCTransactionList Updated successfully' });
    } catch (e) { next(e); }
  },

  assertTrackingSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = req.query as Record<string, unknown>;
      const data = await ppvcTransactionService.getAssetTrackingSummary(filters);
      res.json(data);
    } catch (e) { next(e); }
  },

  moduleStatusList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await ppvcTransactionService.getModuleStatusList();
      res.json(items);
    } catch (e) { next(e); }
  },
};
