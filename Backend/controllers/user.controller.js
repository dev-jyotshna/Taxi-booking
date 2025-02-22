import { User } from '../models/user.model.js'
import { createUser } from '../services/user.service.js'
import { validationResult } from 'express-validator'
import { BlacklistToken } from '../models/blacklistToken.model.js'

const registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() });
    }

    const {fullname, email, password} = req.body

    const isUserAlreadyExist = await User.findOne({ email });
    
    if (isUserAlreadyExist) {
        return res.status(400).json({ message: 'User already exist'})
    }


    const hashedPassword = await User.hashPassword(password);

    const user = await createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    });

    const token = user.generateAuthToken();

    res.status(200).json( {token, user})
}

const loginUser = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() });
    }

    const {email, password} = req.body

    const user = await User.findOne({ email }).select('+password') // get thhe password too since by default password select is false in user.model.js

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password'})
    }

    const isMatch = await user.comparePassword(password) ;

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = user.generateAuthToken();

    res.cookie('token', token);
    res.status(200)   
    .json({ token, user });
}

const getUserProfile = async (req, res) => {
    // get profile to a particular user if the user is logged in, middleware to validate
    res.status(200).json(req.user)
}

const logoutUser = async (req, res) => {
    res.clearCookie('token')
    const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];
    await BlacklistToken.create({token})
    res.status(200).json({message: 'Logged out'});
}

export {
    registerUser,
    loginUser,
    getUserProfile,
    logoutUser
}