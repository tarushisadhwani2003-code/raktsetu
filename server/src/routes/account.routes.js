import { Router } from 'express';
import { changePassword, deleteAccount, updateAccount } from '../controllers/account.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { changePasswordSchema, deleteAccountSchema } from '../validators/account.schemas.js';

const router = Router();

router.use(requireAuth);
router.patch('/', updateAccount);
router.post('/password', validate({ body: changePasswordSchema }), changePassword);
router.delete('/', validate({ body: deleteAccountSchema }), deleteAccount);

export default router;
