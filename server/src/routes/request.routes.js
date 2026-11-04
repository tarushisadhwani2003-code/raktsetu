import { Router } from 'express';
import { cancelRequest, createRequest, getRequest, listMyRequests } from '../controllers/request.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { REQUESTER_ROLES } from '../utils/constants.js';
import { idParams } from '../validators/common.js';
import { requestListQuery } from '../validators/request.schemas.js';

const router = Router();

router.use(requireAuth);
router.post('/', requireRole(...REQUESTER_ROLES), createRequest);
router.get('/mine', requireRole(...REQUESTER_ROLES), validate({ query: requestListQuery }), listMyRequests);
router.get('/:id', validate({ params: idParams }), getRequest);
router.patch('/:id/cancel', requireRole(...REQUESTER_ROLES), validate({ params: idParams }), cancelRequest);

export default router;
