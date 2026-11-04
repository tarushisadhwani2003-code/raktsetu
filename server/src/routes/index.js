import { Router } from 'express';
import accountRoutes from './account.routes.js';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import bloodBankRoutes from './bloodbank.routes.js';
import donorRoutes from './donor.routes.js';
import publicRoutes from './public.routes.js';
import requestRoutes from './request.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/account', accountRoutes);
router.use('/requests', requestRoutes);
router.use('/donor', donorRoutes);
router.use('/bloodbank', bloodBankRoutes);
router.use('/admin', adminRoutes);

export default router;
