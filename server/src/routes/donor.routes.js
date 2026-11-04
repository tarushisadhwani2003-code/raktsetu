import { Router } from 'express';
import {
  getOverview,
  listDonations,
  listMatchingRequests,
  respondToRequest,
  withdrawResponse,
} from '../controllers/donor.controller.js';
import { requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';

const router = Router();

router.use(requireRole('donor'));
router.get('/overview', getOverview);
router.get('/requests', listMatchingRequests);
router.post('/requests/:id/respond', validate({ params: idParams }), respondToRequest);
router.delete('/requests/:id/respond', validate({ params: idParams }), withdrawResponse);
router.get('/donations', listDonations);

export default router;
