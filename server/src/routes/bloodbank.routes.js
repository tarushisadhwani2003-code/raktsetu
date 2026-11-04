import { Router } from 'express';
import {
  adjustStock,
  getInventory,
  getOverview,
  listDonations,
  listRequests,
  lookupDonor,
  recordDonation,
  updateRequestStatus,
} from '../controllers/bloodbank.controller.js';
import { requireRole, requireVerifiedFacility } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  adjustStockSchema,
  donorLookupQuery,
  listQuery,
  recordDonationSchema,
} from '../validators/bloodbank.schemas.js';
import { idParams } from '../validators/common.js';
import { requestActionSchema, requestListQuery } from '../validators/request.schemas.js';

const router = Router();

router.use(requireRole('bloodbank'));
router.get('/overview', getOverview);
router.get('/requests', validate({ query: requestListQuery }), listRequests);
router.patch('/requests/:id', validate({ params: idParams, body: requestActionSchema }), updateRequestStatus);
router.get('/inventory', getInventory);
router.post('/inventory/adjust', validate({ body: adjustStockSchema }), adjustStock);
router.get('/donors/lookup', requireVerifiedFacility, validate({ query: donorLookupQuery }), lookupDonor);
router.get('/donations', validate({ query: listQuery }), listDonations);
router.post('/donations', requireVerifiedFacility, validate({ body: recordDonationSchema }), recordDonation);

export default router;
