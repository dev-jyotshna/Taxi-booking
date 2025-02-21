import { Router } from 'express'
import { body } from "express-validator"
import {
    registerUser,
    loginUser,
    getUserProfile,
    logoutUser
} from "../controllers/user.controller.js"
import { authUser } from '../middleware/auth.middleware.js'

const router = Router()

router.route('/register').post( 
    [
        body('email').isEmail().withMessage('Invalid Email'), 
        body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    ],
    registerUser
)

router.route('/login').post([
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
],
    loginUser
)

router.route('/profile').get(authUser, getUserProfile)
router.route('/logout').get(authUser, logoutUser)

export default router