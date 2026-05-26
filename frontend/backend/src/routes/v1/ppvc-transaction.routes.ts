import { Router } from 'express';
import { ppvcTransactionController } from '../../controllers/ppvc-transaction.controller';

const router = Router();

// ── Matching original .NET API endpoints exactly ───────────────────────────
router.get('/PPVCTransactionApi/List', ppvcTransactionController.list);
router.get('/PPVCTransactionApi/GetById/:id', ppvcTransactionController.getById);
router.post('/PPVCTransactionApi/SaveOrUpdate', ppvcTransactionController.saveOrUpdate);
router.get('/PPVCTransactionApi/Delete/:id', ppvcTransactionController.delete);
router.post('/PPVCTransactionApi/ImportPPVCTransaction', ppvcTransactionController.importPPVCTransaction);
router.post('/PPVCTransactionApi/FilterData/:pageid', ppvcTransactionController.filterData);
router.post('/PPVCTransactionApi/FilterGanttChatData', ppvcTransactionController.filterGanttChatData);
router.get('/PPVCTransactionApi/FilterGanttChatData', ppvcTransactionController.filterGanttChatData);
router.get('/PPVCTransactionApi/PreCastingList', ppvcTransactionController.precastingList);
router.post('/PPVCTransactionApi/PreCastingListUpdate', ppvcTransactionController.precastingListUpdate);
router.get('/PPVCTransactionApi/QcCheckList', ppvcTransactionController.qcCheckList);
router.post('/PPVCTransactionApi/QCCheckListUpdate', ppvcTransactionController.qcCheckListUpdate);
router.get('/PPVCTransactionApi/DeliveryList', ppvcTransactionController.deliveryList);
router.post('/PPVCTransactionApi/DeliveryListUpdate', ppvcTransactionController.deliveryListUpdate);
router.get('/PPVCTransactionApi/GanttChartData', ppvcTransactionController.filterGanttChatData);
router.get('/PPVCTransactionApi/AssertTracking', ppvcTransactionController.assertTrackingSummary);

// Module Status
router.get('/ModuleStatusApi/ActivtyStatusList', ppvcTransactionController.moduleStatusList);

// ── Modern REST API ────────────────────────────────────────────────────────
router.get('/ppvc-transactions', ppvcTransactionController.list);
router.get('/ppvc-transactions/precasting', ppvcTransactionController.precastingList);
router.get('/ppvc-transactions/qc', ppvcTransactionController.qcCheckList);
router.get('/ppvc-transactions/delivery', ppvcTransactionController.deliveryList);
router.get('/ppvc-transactions/asset-tracking', ppvcTransactionController.assertTrackingSummary);
router.get('/ppvc-transactions/:id', ppvcTransactionController.getById);
router.post('/ppvc-transactions', ppvcTransactionController.saveOrUpdate);
router.post('/ppvc-transactions/import', ppvcTransactionController.importPPVCTransaction);
router.post('/ppvc-transactions/filter/:pageid', ppvcTransactionController.filterData);
router.post('/ppvc-transactions/gantt', ppvcTransactionController.filterGanttChatData);
router.post('/ppvc-transactions/precasting/update', ppvcTransactionController.precastingListUpdate);
router.post('/ppvc-transactions/qc/update', ppvcTransactionController.qcCheckListUpdate);
router.post('/ppvc-transactions/delivery/update', ppvcTransactionController.deliveryListUpdate);
router.delete('/ppvc-transactions/:id', ppvcTransactionController.delete);

export default router;
