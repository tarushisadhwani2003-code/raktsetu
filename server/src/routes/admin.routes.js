import { Router } from 'express';
import {
  deleteMessage,
  deleteUser,
  getOverview,
  listFacilities,
  listMessages,
  listRequests,
  listUsers,
  reviewFacility,
  setUserStatus,
  updateMessage,
} from '../controllers/admin.controller.js';
import { requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  adminRequestsQuery,
  facilitiesQuery,
  messageStatusSchema,
  messagesQuery,
  reviewFacilitySchema,
  userStatusSchema,
  usersQuery,
} from '../validators/admin.schemas.js';
import { idParams } from '../validators/common.js';

const router = Router();

router.use(requireRole('admin'));
router.get('/overview', getOverview);

router.get('/users', validate({ query: usersQuery }), listUsers);
router.patch('/users/:id/status', validate({ params: idParams, body: userStatusSchema }), setUserStatus);
router.delete('/users/:id', validate({ params: idParams }), deleteUser);

router.get('/facilities', validate({ query: facilitiesQuery }), listFacilities);
router.patch('/facilities/:id/review', validate({ params: idParams, body: reviewFacilitySchema }), reviewFacility);

router.get('/requests', validate({ query: adminRequestsQuery }), listRequests);

router.get('/messages', validate({ query: messagesQuery }), listMessages);
router.patch('/messages/:id', validate({ params: idParams, body: messageStatusSchema }), updateMessage);
router.delete('/messages/:id', validate({ params: idParams }), deleteMessage);

export default router;
