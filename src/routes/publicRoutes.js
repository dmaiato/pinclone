import { Router } from 'express';
import { getSignupPage, signupRequest, getLoginPage, loginRequest, logoutRequest } from '../controllers/authController.js';

const router = Router();

router.get('/signup', getSignupPage);
router.post('/signup', signupRequest);

router.get('/login', getLoginPage);
router.post('/login', loginRequest);

router.get('/logout', logoutRequest);

export default router;