import { Router } from 'express';
import auth from './auth';
import videos from './videos';
const router = Router();
router.use('/auth', auth);
router.use('/videos', videos);
export default router;
