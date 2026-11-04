import { Router } from 'express';
import {
  createContactMessage,
  getBloodBank,
  getConfig,
  getStats,
  listBloodBanks,
  listCities,
} from '../controllers/public.controller.js';
import { contactLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { bloodBanksQuery, contactSchema } from '../validators/public.schemas.js';

const router = Router();

router.get('/config', getConfig);
router.get('/stats', getStats);
router.get('/cities', listCities);
router.get('/blood-banks', validate({ query: bloodBanksQuery }), listBloodBanks);
router.get('/blood-banks/:id', validate({ params: idParams }), getBloodBank);
router.post('/contact', contactLimiter, validate({ body: contactSchema }), createContactMessage);

export default router;
