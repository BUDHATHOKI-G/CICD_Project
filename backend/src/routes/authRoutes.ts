
import { Router } from 'express';
import * as authController from '../controllers/authController';
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

console.log("TYPE OF verifyToken:", typeof verifyToken);
console.log("TYPE OF welcome:", typeof authController.welcome);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);
router.get('/welcome', verifyToken, authController.welcome);

export default router;