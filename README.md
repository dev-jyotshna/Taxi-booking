# Taxi booking project

## Set up
- make sure the enty point is server.js here
- create folder named Backend
- npm init (initialize the node)
- npm i express
- create new file app.js
- add below code in app.js withhello world being temp check to ensure our server works properly
```js
import express from "express"
const app = express()

app.get('/', (res, req) => {
    res.send('Hello World')
})
export {app}
```
- git init
- create file .gitignore
- add gitignore code from the gitignore generator in it for starters
- git add .
- git commit -m "first commit"
- git branch -M main
- git remote add origin <git-http-reponame>
- git push -u origin main
- cd Backend
- npm i dotenv cors
```js
import dotenv from "dotenv"
dotenv.config({ path: './.env'})
```
- add the above code in the line 1 of server.js 
- add cors code in app.js
```js
import express from "express"
import cors from "cors"

const app = express()
app.use(cors());


app.get('/', (res, req) => { //FIrst bug
    res.send('Hello World')
})
export {app}
```

- add below code in server.js
```js
import dotenv from "dotenv"
dotenv.config({ path: './.env'})
// import http from "http"
import {app} from './app.js'

const port = process.env.PORT || 3000

app.on("error", (error) => {
    console.log("ERRR:", error);;
    throw error
})
app.listen(port, () => {
    console.log(`Server is running at port : ${port}`)
})
```
- add PORT in .env file too
- add "type": "module" above "main" in package.json
- FIRST bug => TypeError: res.send is not a function
    - Soln: instead of (res, req) use (req, res) in app.js in app.get
- npm run start or use nodemon 

## Model using mongoose
- user model for user authentication
- npm i mongoose // in backend integrated terminal
- create folder named db & in that new file db.js
- add DB_CONNECT with the name of the mongodb database in .env 
```
PORT=4000
DB_CONNECT=mongodb://0.0.0.0/uber-video
```
- create a function named connectDB and add below code in it in file db.js
```js
import mongoose from "mongoose"

const connectDB = async () => {
    mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log('Connected to DB');
    })
    .catch(err => console.log(err));
}

export default connectDB;
```
- import the connectDB function in server.js 
    - This makes the server.js responsible for starting the server and handling database connectivity.
- added the below code in server.js
```js
import connectDB from './db/db.js'
connectDB()
```
- used npx nodemon
- BUG FIX => 0.0.0.0 gave me error: MongooseServerSelectionError: connect ECONNREFUSED 0.0.0.0:27017
    - Soln: installing the mongodb locally [from here](https://youtu.be/tC49Nzm6SyM?si=kCR49uvUVRMTlmFg)
- output :
    Server is running at port : 4000
    Connected to DB

- create a folder "models" & create file "user.model.js"
- use jwt for password verification
- use socketId for tracking the driver/captian's live location and sharing it with the user
- npm i bcrypt jsonwebtoken //for authentication
- add the below code for model in user.model.js
```js
import mongoose from 'mongoose'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, "First name must be atleast 3 characters long "]
        },
        lastname: {
            type: String,
            minlength: [3, "Last name must be atleast 3 characters long "]
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, 'Email must be at least 5 characters long']
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    socketId: {
        type: String,
    }
}, { timestamps: true})

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id}, process.env.JWT_SECRET)
    return token;
}

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

export const User = mongoose.model("User", userSchema)
```
## Controllers & routes
### register user
- create folder "controllers" and a file "user.controller.js"
- add below code in it
```js
import { User } from '../models/user.model.js'

const registerUser = async (req, res, next) => {
    
}

export {
    registerUser
}
```
- create folder "routes" and file "user.route.js"
- npm install express-validator
```js
import { Router } from 'express'
import { body } from "express-validator"
import {
    registerUser
} from "../controllers/user.controller.js"

const router = Router()

router.route('/register').post( 
    [
        body('email').isEmail().withMessage('Invalid Email'), 
        body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    ],
    registerUser
)

export default router
```
- create a folder "services" and file "user.service.js"
```js
import { User } from "../models/user.model.js";

export const createUser = async ({
    firstname, lastname, email, password
}) => {
    if (!firstname || !email || !password) {
        throw new Error('All fields are required')
    }
    const user = User.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password
    })

    return user;
}
```
- in user.controller.js add below code
```js
import { User } from '../models/user.model.js'
import { createUser } from '../services/user.service.js'
import { validationResult } from 'express-validator'

const registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() });
    }

    const {firstname, lastname, email, password} = req.body

    const isUserAlreadyExist = await User.findOne({ email });
    
        if (isUserAlreadyExist) {
            return res.status(400).json({ message: 'User already exist'})
        }

    const hashedPassword = await User.hashPassword(password);

    const user = await createUser({
        firstname,
        lastname,
        email,
        password: hashedPassword
    })
}

export {
    registerUser
}
```
- give JWT_SECRET value in .env file
- add below code in user.controller.js
```js
import { User } from '../models/user.model.js'
import { createUser } from '../services/user.service.js'
import { validationResult } from 'express-validator'

const registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() });
    }

    const isUserAlreadyExist = await User.findOne({ email });
    
        if (isUserAlreadyExist) {
            return res.status(400).json({ message: 'User already exist'})
        }

    const {firstname, lastname, email, password} = req.body

    const hashedPassword = await User.hashPassword(password);

    const user = await createUser({
        firstname,
        lastname,
        email,
        password: hashedPassword
    });

    const token = user.generateAuthToken();

    res.status(200).json( {token, user})
}

export {
    registerUser
}
```
- import routes in app.js
```js
import express from "express"
import cors from "cors"

const app = express()
app.use(cors());

app.use(express.json())
app.use(express.urlencoded( {extended: true}))

app.get('/', (req, res) => {
    res.send('Hello World')
})

//import routes
import userRouter from './routes/user.route.js'

app.use("/users", userRouter)

export {app}
```
- check if server is working correctly using postman
- post : url : http://localhost:4000/users/register , body>raw>
```json
{
    "fullname":{
        "firstname": "test_firstname",
        "lastname":"test_lastname"
    },
    "email": "test@test.com",
    "password": "test_password"
}
```
- npx nodemon
- FIX BUG: ReferenceError: firstname is not defined at registerUser
    - soln : change how to access the firstname & lastname in user.controller.js
```js
    const user = await createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    });
```
- create docs for every route in Backend README.md file

### login user
- create the route for user login in user.route.js add the code below
```js
import { Router } from 'express'
import { body } from "express-validator"
import {
    registerUser,
    loginUser
} from "../controllers/user.controller.js"

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

export default router
```
- add controller function loginUser in user.controller.js for login
```js
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
    res.status(200).json({ token, user });
}

export {
    registerUser,
    loginUser
}
```
- check in postman for http://localhost:4000/userse/login and body>raw>below code , then test incorrect password for test1 then incorrect email for test2
```json
{
    "email": "test@test.com",
    "password": "test_password"
}
```
- create login route api documentation

### get user profile
- add below code in user.route.js
```js
router.route('/profile').get(getUserProfile)

export default router
```
- add controller for it 
- for validating the if user is logged in we use middleware
- create folder "middleware" & file "auth.middleware.js"
- use token to get if the user is logged in or not
- we get token from either header or from cookies
- add below code in auth.middleware.js
```js
import { User } from "../models/user.model.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id)

        req.user = user;

        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized'})
    }
}
```
- now update this middleware authorization in user.route.js
```js
import { Router } from 'express'
import { body } from "express-validator"
import {
    registerUser,
    loginUser,
    getUserProfile
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

export default router
```
- add the code in user.controller.js
```js
const getUserProfile = async (req, res) => {
    // get profile to a particular user if the user is logged in, middleware to validate
    res.status(200).json(req.user)
}

export {
    registerUser,
    loginUser,
    getUserProfile
}
```
- use cookie-parser 
- npm i cookie-parser
- import it in the app.js
```js
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()
app.use(cors());

app.use(express.json())
app.use(express.urlencoded( {extended: true}))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Hello World')
})

//import routes
import userRouter from './routes/user.route.js'

app.use("/users", userRouter)

export {app}
```
- npx nodemon
- check the profile from header and cookie in the postman
- using headers
- ![alt text](<Screenshot 2025-02-21 002702.png>)
- using cookies
- add res.cookie with its code in loginUser in user.controller.js
```js
    const token = user.generateAuthToken();

    res.cookie('token', token);
    res.status(200)   
    .json({ token, user });
}

const getUserProfile = async (req, res) => {
    // get profile to a particular user if the user is logged in, middleware to validate
    res.status(200).json(req.user)
}

export {
    registerUser,
    loginUser,
    getUserProfile
}
```
- check in postman again
- it works properly

### logout route
- with jwt and help of database
- make a collection of blacklisted tokens(those tokens that have been logged out)
- then check if the token exists in it or not
- storing every token in the database will not be good for the memory so we use TTL time to live(it automaticallt deletes the document after the TTL is done)
- create file models> blacklistToken.model.js
```js
import mongoose from 'mongoose'

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 //24 hr in secs
    }
});
export const BlacklistToken = mongoose.model('BlacklistToken', blacklistTokenSchema)
```
- update token expiration time in user.model.js
```js
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id}, process.env.JWT_SECRET, { expiresIn: '24h'})
    return token;
}
```
- create logout route in user.route.js
```js
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
```
- create logoutUser controller in user.controller.js and import blacklistTOken model
```js
import { User } from '../models/user.model.js'
import { createUser } from '../services/user.service.js'
import { validationResult } from 'express-validator'
import { BlacklistToken } from '../models/blacklistToken.model.js'

const registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() });
    }

    const isUserAlreadyExist = await User.findOne({ email });
    
        if (isUserAlreadyExist) {
            return res.status(400).json({ message: 'User already exist'})
        }


    const {fullname, email, password} = req.body

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
```
- token can still be stored in local sorage of the user, so to prevent it from happening we update the middleware auth.middleware.js
- add below code in authUser function 
```js
    const isBlacklisted = await User.findOne({ token: token })
    if(isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
```
- Bug FIX : encountered a bug in database field as instaed of writing token i wrote toke and started a fundamental error
    - soln : i needed to delete the database and run all the routes and check them all in postman again
- checking the routes in postman as follows : 
    1. register
    2. login
    3. profile: got profile info
    4. logout
    5. profile: got unauthorized 
- working properly

- docs for profile and logout route endpoint
- Now basic authentication for user is done

## Start of captain authentication
- create captain.model.js in models folder
- add the below code in captain.model.js
```js
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'Firstname must be at least 3 characters long']
        },
        lastname: {
            type: String,
            minlength: [3, 'Lastname must be at least 3 characters long']
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    socketId: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    vehicle: {
        color: {
            type: String,
            required: true,
            minlength: [3, 'Color must be at least 3 characters long']
        },
        plate: {
            type: String,
            required: true,
            minlength: [3, 'Plate must be at least 3 characters long']
        },
        capacity: {
            type: Number,
            requires: true,
            min: [ 1, 'Capacity must be at least 1']
        },
        vehicleType: {
            type: String,
            required: true,
            enum: ['car', 'motorcycle', 'auto']
        }
    },
    location: {
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        }
    }
}) 

captainSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h'});
    return token;
}

captainSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password)
}

captainSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
}

export const Captain = mongoose.model("Captain", captainSchema)
```
- create controller for captain captain.controller.js
```js
import { Captain } from "../models/captain.model.js";

```
- create routes for captain controller in captain.route.js
```js
import { Router } from "express";

const router = Router()

export default router
```
- use the captain.route.js routes in app.js to make it actually work
- update and add the below code in app.js
```js
//import routes
import userRouter from './routes/user.route.js'
import captainRouter from './routes/captain.route.js'

app.use("/users", userRouter)
app.use("/captains", captainRouter)

export {app}
```
- add the below code in captain.route.js 
```js
import { Router } from "express";
import { body } from "express-validator";
import { registerCaptain } from "../controllers/captain.controller.js";

const router = Router()

router.route('/register').post(
    [
        body('email').isEmail().withMessage('Invalid Email'), 
        body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
        body('vehicle.color').isLength({ min: 3 }).withMessage('Color must be at least 3 characters long'),
        body('vehicle.plate').isLength({ min: 3 }).withMessage('Plate must be at least 3 characters long'),
        body('vehicle.capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1 '),
        body('vehicle.vehicleType').isIn(['car', 'motorcycle', 'auto']).withMessage('Invalid vehicle type'),
    ],
    registerCaptain
)

export default router
```
- create a captain.service.js file and add the below code in it
```js
import { Captain } from "../models/captain.model.js";

export const createCaptain = async ({ 
    firstname, lastname, email, password, color, plate, capacity, vehicleType
}) => {
    if (!firstname || !email || !password || !color || !plate || !capacity) {
        throw new Error('All fields are required');
    }

    const captain = Captain.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        }
    })

    return captain
}
```
- import it in the captain.controller.js and the add below
```js
import { Captain } from "../models/captain.model.js";
import { createCaptain } from "../services/captain.service.js";
import { validationResult } from "express-validator";


const registerCaptain = async (req, res) => {

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {fullname, email, password, vehicle} = req.body

    const isCaptainAlreadyExist = await Captain.findOne({ email });

    if (isCaptainAlreadyExist) {
        return res.status(400).json({ message: 'Captain already exist'})
    }

    const hashedPassword = await Captain.hashPassword(password) 

    const captain = await createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });

    const token = captain.generateAuthToken();

    res.status(201).json({ token, captain})
}

export {
    registerCaptain
}
```
- check the register route in postman for captain
- create docs for register captain route
- captain registration done

### login route

 - import loginCaptain in captain.route.js and add the below code in it
 ```js
 router.route('/login').post(
    [
        body('email').isEmail().withMessage('Invalid Email'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],
    loginCaptain
)

export default router
```
- add the below code in captain.controller.js
```js
const loginCaptain = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {email, password} = req.body

    const captain = await Captain.findOne({ email }).select('+password')

    if (!captain) {
        return res.status(401).json({ message: 'Invalid email or password'})
    }

    const isMatch = await captain.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password'})
    }

    const token = captain.generateAuthToken();

    res.cookie('token', token)
    res.status(200).json({ token, captain })
}

export {
    registerCaptain,
    loginCaptain
}
```
### show captain profile 
- add the below code in auth.middleware.js to authenticate captain before showing the captain profile
```js
import { User } from "../models/user.model.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {BlacklistToken} from '../models/blacklistToken.model.js'
import { Captain } from "../models/captain.model.js"

export const authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const isBlacklisted = await BlacklistToken.findOne({ token: token })
    if(isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id)

        req.user = user;

        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized'})
    }
}

export const authCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const isBlacklisted = await BlacklistToken.findOne({ token: token })
    if(isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await Captain.findById(decoded._id)
        req.captain = captain;

        return next()
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized'})
    }
}
```
- add the below code in captain.route.js
```js
import { Router } from "express";
import { body } from "express-validator";
import { 
    registerCaptain,
    loginCaptain,
    getCaptainProfile
 } from "../controllers/captain.controller.js";
import { authCaptain } from "../middleware/auth.middleware.js";

const router = Router()

router.route('/register').post(
    [
        body('email').isEmail().withMessage('Invalid Email'), 
        body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
        body('vehicle.color').isLength({ min: 3 }).withMessage('Color must be at least 3 characters long'),
        body('vehicle.plate').isLength({ min: 3 }).withMessage('Plate must be at least 3 characters long'),
        body('vehicle.capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1 '),
        body('vehicle.vehicleType').isIn(['car', 'motorcycle', 'auto']).withMessage('Invalid vehicle type'),
    ],
    registerCaptain
)

router.route('/login').post(
    [
        body('email').isEmail().withMessage('Invalid Email'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],
    loginCaptain
)

router.route('/profile').get(authCaptain, getCaptainProfile)

export default router
```
- add the below code in captain.controller.js for getCaptainProfile
```js
const getCaptainProfile = async (req, res) => {
    res.status(200).json({ captain: req.captain })
}

export {
    registerCaptain,
    loginCaptain,
    getCaptainProfile
}
```
### logout route
- import logoutCaptain and add the below code in captain.route.js
```js
router.get('/logout', authCaptain, logoutCaptain)

export default router
```
- add the below code in captain.controller.js
```js
const logoutCaptain = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    await BlacklistToken.create({ token });

    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successfully'})
}

export {
    registerCaptain,
    loginCaptain,
    getCaptainProfile,
    logoutCaptain
}
```
- check in postman login, profile, logout routes
- check login, profile: shows captain profile, logout, profile: unauthorized
- routes are working properly
- docs for every route
- captain authentication done

## Starting Frontend
- in Taxi Booking(Uber clone) folder 
- npm create vite@latest
- now use react and vanilla javascript , a folder named Frontend is created now 
- cd Frontend
- npm i
- npm run dev
- in App.jsx delete the default code and write rafce then click enter 
- remove code from index.css
- for using tailwindcss
- npm install -D tailwindcss postcss autoprefixer
- npm install tailwindcss @tailwindcss/vite

- add the below code in vite.config.js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
})

```
- add below code in index.css
```css
@import "tailwindcss";
```
- npm run dev
- There were major changes in the installation of tailwind for the vite react app 
- from the last time I use of tailwind in the react app 

- when opening the app we get this 
- create folder "pages" inn Frontend>src
- create Home.jsx, UserLogin.jsx, UserSignUp.jsx, CaptainLogin.jsx, CaptainSignUp.jsx
- do rfce for the above pages in these files
- routing : to get from one page to another page usig react router don in App.jsx
- npm i react-router-dom
- add the below code in main.jsx
```js
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>,
)
```
- add below code to add routes in App.jsx
```js
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import UserLogin from './pages/UserLogin'
import UserSignUp from './pages/UserSignUp'
import CaptainLogin from './pages/CaptainLogin'
import CaptainSignUp from './pages/CaptainSignUp'

const App = () => {
  return (
    <div >
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/login' element={<UserLogin />}/>
        <Route path='/signup' element={<UserSignUp />}/>
        <Route path='/captain-login' element={<CaptainLogin />}/>
        <Route path='/captain-signup' element={<CaptainSignUp />}/>
      </Routes>
    </div>
  )
}

export default App
```
- add the below code in Home.jsx
```jsx
import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
        <div className='bg-cover bg-[url(https://images.unsplash.com/photo-1538563188159-070c4db2bc65?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] h-screen  pt-15 flex justify-between flex-col w-full '>
            <img className='w-14 ml-9' src="../../1659761100uber-logo-png.png" />
            <div className='bg-white pb-7 py-4 px-4'>
                <h2 className='text-3xl font-bold '>Get started with Uber</h2>
                <Link to='/login' className='flex items-center justify-center w-full  bg-black text-white py-3 rounded mt-4'>Continue</Link>
            </div>
        </div>
    </div>
  )
}

export default Home
```
- adding the picture in home.jsx by searching it in the google lens can be used or in anyother image can also be used
- add the below code in pages>UserLogin.jsx 
```jsx
import React from 'react'
import { Link } from 'react-router-dom'

function UserLogin() {
  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
        <img className='w-16 mb-10' src="../../1659761100uber-logo-png.png" />
        <form >
          <h3 className='text-lg font-medium mb-2'>What's your email?</h3>
          <input 
            required 
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="email" 
            placeholder='email@example.com'
          />
          
          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input 
            required 
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="password" 
            placeholder='password'
          />
          <button
            className='bg-[#111] rounded mb-3 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
          >Login</button>

          <p className='text-center'>New here? <Link to='/signup' className='text-blue-600'> Create new Account</Link></p>
        </form>
      </div>

      <div>
        <button
          className='bg-[#10b461] rounded mb-7 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
        >Sign in as Captain</button>
      </div>
    </div>
  )
}

export default UserLogin
```
- add below code for now performing two-way binding in pages>UserLogin.jsx to get data to save as an object
```jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function UserLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userData, setUserData] = useState({})


  const submitHandler = (e) => {
    e.preventDefault();
    setUserData({
      email: email,
      password: password
    })
    setEmail('')
    setPassword('')
  }

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
        <img className='w-16 mb-10' src="../../1659761100uber-logo-png.png" />
        <form onSubmit={(e) => {
          submitHandler(e)
        }}>
          <h3 className='text-lg font-medium mb-2'>What's your email?</h3>
          <input 
            required 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="email" 
            placeholder='email@example.com'
          />
          
          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input 
            required 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="password" 
            placeholder='password'
          />
          <button
            className='bg-[#111] rounded mb-3 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
          >Login</button>

          <p className='text-center'>New here? <Link to='/signup' className='text-blue-600'> Create new Account</Link></p>
        </form>
      </div>

      <div>
        <Link to='/captain-login'
          className='bg-[#10b461] flex items-center justify-center rounded mb-5 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
        >Sign in as Captain</Link>
      </div>
    </div>
  )
}

export default UserLogin
```
- add below code in pages/CaptainLogin.jsx
```jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function CaptainLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captainData, setCaptainData] = useState({})


  const submitHandler = (e) => {
    e.preventDefault();
    setCaptainData({
      email: email,
      password: password
    })
    setEmail('')
    setPassword('')
  }

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
        <img className='w-20 mb-2' src="..\uber-driver.svg" />
        <form onSubmit={(e) => {
          submitHandler(e)
        }}>
          <h3 className='text-lg font-medium mb-2'>What's your email?</h3>
          <input 
            required 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="email" 
            placeholder='email@example.com'
          />
          
          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input 
            required 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="password" 
            placeholder='password'
          />
          <button
            className='bg-[#111] rounded mb-3 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
          >Login</button>

          <p className='text-center'>Join a fleet? <Link to='/captain-signup' className='text-blue-600'> Register as a captain</Link></p>
        </form>
      </div>

      <div>
        <Link to='/login'
          className='bg-[#cd4204] flex items-center justify-center rounded mb-5 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
        >Sign in as User</Link>
      </div>
    </div>
  )
}

export default CaptainLogin
```
- add the below code in pages/UserSignUp.jsx with two-way binding of data
```jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function UserSignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userData, setUserData] = useState({})

  const submitHandler = (e) => {
    e.preventDefault();
    setUserData({
      fullName: {
        firstName: firstName,
        lastName: lastName
      },
      email: email,
      password: password
    })
    
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
  }

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
        <img className='w-16 mb-10' src="../../1659761100uber-logo-png.png" />
        <form onSubmit={(e) => {
          submitHandler(e)
        }}>
          <h3 className='text-lg font-medium mb-2'>What's your name?</h3>
          <div className='flex gap-4 mb-6'>
            <input 
              required 
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='First name'
              value={firstName}
              onChange={(e) =>{
                setFirstName(e.target.value)
              }}
            />
            <input 
              required 
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='Last name'
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
              }}
            />
          </div>
          <h3 className='text-lg font-medium mb-2'>What's your email?</h3>
          <input 
            required 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-6 px-4 py-2  w-full text-lg placeholder:text-base'
            type="email" 
            placeholder='email@example.com'
          />
          
          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input 
            required 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-6 px-4 py-2  w-full text-lg placeholder:text-base'
            type="password" 
            placeholder='password'
          />
          <button
            className='bg-[#111] rounded mb-3 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
          >Login</button>

          <p className='text-center'>Already have an account? <Link to='/login' className='text-blue-600'> Login here</Link></p>
        </form>
      </div>

      <div>
        <p className='text-[10px] leading-tight'>This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service apply</span></p>
      </div>
    </div>
  )
}

export default UserSignUp
```
- add the below code in CaptainSignUp.jsx with two-way binding
```jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function CaptainSignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userData, setUserData] = useState({})

  const submitHandler = (e) => {
    e.preventDefault();
    setUserData({
      fullName: {
        firstName: firstName,
        lastName: lastName
      },
      email: email,
      password: password
    })
    
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
  }

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
      <img className='w-20 mb-2' src="..\uber-driver.svg" />
      <form onSubmit={(e) => {
          submitHandler(e)
        }}>
          <h3 className='text-lg font-medium mb-2'>What's your name?</h3>
          <div className='flex gap-4 mb-6'>
            <input 
              required 
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='First name'
              value={firstName}
              onChange={(e) =>{
                setFirstName(e.target.value)
              }}
            />
            <input 
              required 
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='Last name'
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
              }}
            />
          </div>
          <h3 className='text-lg font-medium mb-2'>What's your email?</h3>
          <input 
            required 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-6 px-4 py-2  w-full text-lg placeholder:text-base'
            type="email" 
            placeholder='email@example.com'
          />
          
          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input 
            required 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-6 px-4 py-2  w-full text-lg placeholder:text-base'
            type="password" 
            placeholder='password'
          />
          <button
            className='bg-[#111] rounded mb-3 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
          >Sign Up</button>

          <p className='text-center'>Already have an account? <Link to='/captain-login' className='text-blue-600'> Login here</Link></p>
        </form>
      </div>

      <div>
        <p className='text-[10px] leading-tight'>This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service apply</span></p>
      </div>
    </div>
  )
}

export default CaptainSignUp
```
- write context for centralizing our data, we could have used redux tool kit here too
- create a folder named "context"
- create a file src/context/UserContext.jsx and write rafce then click enter
- now i have to wrap the whole app into userContext using main.jsx
- add and update the below code in main.jsx
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import UserContext from './context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContext>
    <BrowserRouter>
    <App />
    </BrowserRouter>
    </UserContext>
  </StrictMode>,
)
```
- add the below code in src/context/UserContext.jsx
```jsx
import React, { createContext, useState } from 'react'

export const UserDataContext = createContext()

const UserContext = ({children}) => {

  const [user, setUser] = useState({
    email:'',
    fullName: {
      firstName: '',
      lastName: ''
    }
  })

  return (
    <div>
      <UserDataContext.Provider value={[user, setUser]}>
      {children}
      </UserDataContext.Provider>
    </div>
  )
}

export default UserContext
```
- completed home, login, signup pages for user and captain 
- git branch -M frontend
- git push -u origin frontend

## merge the code in frontend branch into main branch
- git pull origin frontend
- git checkout main
- git merge frontend
- git push -u origin main

## backend to frontend 
### Integrating user endpoints with react
- rename current pages/Home.jsx to Start.jsx 
- make another pages as Home.jsx and route the path into App.jsx
```jsx
import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Start from './pages/Start'
import Home from './pages/Home'
import UserLogin from './pages/UserLogin'
import UserSignUp from './pages/UserSignUp'
import CaptainLogin from './pages/CaptainLogin'
import CaptainSignUp from './pages/CaptainSignUp'

const App = () => {

  return (
    <div >
      <Routes>
        <Route path='/' element={<Start />}/>
        <Route path='/login' element={<UserLogin />}/>
        <Route path='/signup' element={<UserSignUp />}/>
        <Route path='/captain-login' element={<CaptainLogin />}/>
        <Route path='/captain-signup' element={<CaptainSignUp />}/>
        <Route path='/home' element={<Home />}/>
      </Routes>
    </div>
  )
}

export default App
```
- add the below code and add the useNavigate into pages/UserSignUp.jsx 
- to send the data we get from the frontend to the server we use axios
- npm i axios
- since url changes in development and in production we use a URL varaiable in .env file in react app
- to set the user we use context
```jsx
import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {UserDataContext} from '../context/userContext'

const UserSignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userData, setUserData] = useState({})

  const navigate = useNavigate()

  const {user, setUser} = useContext(UserDataContext)

  const submitHandler = async (e) => {
    e.preventDefault();

    const newUser = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password
    }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, newUser)
    
    if (response.status === 201) {
      const data = response.data

      setUser(data.user)

      navigate('/home')
    }
    
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
  }

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
        <img className='w-16 mb-10' src="../../1659761100uber-logo-png.png" />
        <form onSubmit={(e) => {
          submitHandler(e)
        }}>
          <h3 className='text-lg font-medium mb-2'>What's your name?</h3>
          <div className='flex gap-4 mb-6'>
            <input 
              required 
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='First name'
              value={firstName}
              onChange={(e) =>{
                setFirstName(e.target.value)
              }}
            />
            <input 
              required 
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='Last name'
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
              }}
            />
          </div>
          <h3 className='text-lg font-medium mb-2'>What's your email?</h3>
          <input 
            required 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-6 px-4 py-2  w-full text-lg placeholder:text-base'
            type="email" 
            placeholder='email@example.com'
          />
          
          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input 
            required 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-6 px-4 py-2  w-full text-lg placeholder:text-base'
            type="password" 
            placeholder='password'
          />
          <button
            className='bg-[#111] rounded mb-3 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
          >Create Account</button>

          <p className='text-center'>Already have an account? <Link to='/login' className='text-blue-600'> Login here</Link></p>
        </form>
      </div>

      <div>
        <p className='text-[10px] leading-tight'>This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service apply</span></p>
      </div>
    </div>
  )
}

export default UserSignUp
```
- check and send data in frontend to backend
- in Frontend terminal wrte "npm run dev"
- in Backend terminal wrte "npx nodemon"
- bug FIX: not able to navigate to /home url as i used if statement to check reponse status to be 201 but i sent thebackend reponse status as 200 so i was not able to navigate 
  - Soln used console.log everywhere in pages/UserSIgnUp.jsx in if statement then found that we are getting response status as 200 instead of 200 so I checked Backend/controller/user.controllers.js and sent 201 now
- No Changes in Frontend/src/pages/UserSignUp.jsx
- Changes in Backend/controller/user.controllers.js from     res.status(200).json( {token, user}) 
- to: 
```jsx
    const user = await createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    });

    const token = user.generateAuthToken();

    res.status(201).json( {token, user})
}
```
- add code to integrate user endpoints(backend) with react and update with below code in pages/UserLogin.jsx 
```jsx
import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/userContext'
import axios from 'axios'

function UserLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userData, setUserData] = useState({})

  const navigate = useNavigate()

  const { user, setUser } = useContext(UserDataContext)


  const submitHandler = async (e) => {
    e.preventDefault();
    
    const userData = {
      email: email,
      password: password
    }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userData)

    if(response.status === 200) {
      const data = response.data
      setUser(data.user)
      navigate('/home')
    }

    setEmail('')
    setPassword('')
  }

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
        <img className='w-16 mb-10' src="../../1659761100uber-logo-png.png" />
        <form onSubmit={(e) => {
          submitHandler(e)
        }}>
          <h3 className='text-lg font-medium mb-2'>What's your email?</h3>
          <input 
            required 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="email" 
            placeholder='email@example.com'
          />
          
          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input 
            required 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="password" 
            placeholder='password'
          />
          <button
            className='bg-[#111] rounded mb-3 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
          >Login</button>

          <p className='text-center'>New here? <Link to='/signup' className='text-blue-600'> Create new Account</Link></p>
        </form>
      </div>

      <div>
        <Link to='/captain-login'
          className='bg-[#10b461] flex items-center justify-center rounded mb-5 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
        >Sign in as Captain</Link>
      </div>
    </div>
  )
}

export default UserLogin
```
- right now home is an unprotected route
- a logged in user should be the only one who should get to got to home route
- for that we need an higher order function(UserProtectedWrapper) that checks if the user is logged in or not
- create a file Frontend/src/pages/UserProtectedWrapper.jsx
- if the user exists then it will return the children if not it will navigate the user to login page
- add the below code in Frontend/src/pages/UserProtectedWrapper.jsx
```jsx
import React, { useContext } from 'react'
import { UserDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'

function UserProtectedWrapper({children}) {

    const { user } = useContext(UserDataContext)
    const navigate = useNavigate()

    if(! user.email) {
        navigate('/login')
    }
  return (
    <>
        {children}
    </>
  )
}

export default UserProtectedWrapper
```
- here if the user reloads the page they can get logged out 
- so instead of depending on user we can depend on token
- whenever the user logs in, since we are using setUser , we can also use localstorage to set item token
- update the pages/UserLogin.jsx with the code below
```jsx
    if(response.status === 200) {
      const data = response.data
      setUser(data.user)
      localStorage.setItem('token', data.token)
      navigate('/home')
    }
```
- update this portion in pages/SignUp.jsx too
```jsx
    
    if (response.status === 201) {
      const data = response.data

      setUser(data.user)
      localStorage.setItem('token', data.token)
      navigate('/home')
    }
```
- to depend the login to a token instead of user the changes will be from
```jsx
function UserProtectedWrapper({children}) {

    const { user } = useContext(UserDataContext)
    const navigate = useNavigate()

    if(! user.email) {
        navigate('/login')
    }
  return (
    <>
        {children}
    </>
  )
}
```
- to
```jsx
import React, { useContext } from 'react'
import { UserDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'

function UserProtectedWrapper({children}) {

  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  if(! token) {
      navigate('/login')
  }
  return (
    <>
        {children}
    </>
  )
}

export default UserProtectedWrapper
```
- Now we need to wrap the Home component in App.jsx with UserProtectedWrapper component
- update the code in App.jsx
```jsx
import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Start from './pages/Start'
import Home from './pages/Home'
import UserLogin from './pages/UserLogin'
import UserSignUp from './pages/UserSignUp'
import CaptainLogin from './pages/CaptainLogin'
import CaptainSignUp from './pages/CaptainSignUp'
import UserProtectedWrapper from './pages/UserProtectedWrapper'

const App = () => {

  return (
    <div >
      <Routes>
        <Route path='/' element={<Start />}/>
        <Route path='/login' element={<UserLogin />}/>
        <Route path='/signup' element={<UserSignUp />}/>
        <Route path='/captain-login' element={<CaptainLogin />}/>
        <Route path='/captain-signup' element={<CaptainSignUp />}/>
        <Route path='/home' element={
          <UserProtectedWrapper>
            <Home />
          </UserProtectedWrapper>
        }/>
      </Routes>
    </div>
  )
}

export default App
```
- logging in user in the browser we got to Home page, the delete the token from Application>localStorage dev tool, then reloading the page

-  add route in App.jsx
```jsx
        <Route path='/home' element={
          <UserProtectedWrapper>
            <Home />
          </UserProtectedWrapper>
        }/>
        <Route path='/user/logout' element={
          <UserProtectedWrapper>
            <UserLogout />
          </UserProtectedWrapper>
        } />
      </Routes>
```
- Create Frontend/pages/UserLogout.jsx 

- after user login we go to home , then writing localhost:5173/user/logout in the url we correctly log out from the user account
- but home route is still unprotected, meaning when we got to localhost:5173/home we can still access it without logging in
- now we use usEffect hook in UserProtectedWrapper for it to remove access of home unprotected
- add the below code in Frontend/src/pages/UserProtectedWrapper.jsx
```jsx
import React, { useContext, useEffect } from 'react'
import { UserDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'

function UserProtectedWrapper({children}) {

  const token = localStorage.getItem('token')
  const navigate = useNavigate()  

  useEffect(() => {
    if(!token) {
      navigate('/login')
    }
  })

  return (
    <>
      {children}
    </>
  )
}

export default UserProtectedWrapper
```

### Integrating captain endpoints with react
- Create Frontend/src/context/CaptainContext.jsx
- add below code in it
```jsx
import { createContext, useContext, useState } from "react";

export const CaptainDataContext = createContext();


const CaptainContext = ({ children }) => {
    const [ captain, setCaptain ] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [ error, setError ] = useState(null);

    const updateCaptain = (captainData) => {
        setCaptain(captainData)
    };

    const value = {
        captain,
        setCaptain,
        isLoading,
        setIsLoading,
        error,
        setError,
        updateCaptain
    };

    return (
        <CaptainDataContext.Provider value={value}>
            {children}
        </CaptainDataContext.Provider>
    )
}

export default CaptainContext
```
- Wrap the react app in CaptainContext element similarly to UserContext element in main.jsx
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import UserContext from './context/UserContext.jsx'
import CaptainContext from './context/CaptainContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CaptainContext>
      <UserContext>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserContext>
    </CaptainContext>
  </StrictMode>,
)

```
- use context, add vehicle details and add the below code in Frontend/src/pages/CaptainSignUp.jsx
```jsx
import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'

function CaptainSignUp() {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [ vehicleColor, setVehicleColor ] = useState('')
  const [ vehiclePlate, setVehiclePlate ] = useState('')
  const [ vehicleCapacity, setVehicleCapacity ] = useState('')
  const [ vehicleType, setVehicleType ] = useState('')

  const { captain, setCaptain } = useContext(CaptainDataContext)

  const submitHandler = async (e) => {
    e.preventDefault();
    const newCaptain = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType: vehicleType
      }
    }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, newCaptain)

    if (response.status === 201) {
      const data = response.data
      setCaptain(data.captain)
      localStorage.setItem('token', data.token)
      navigate('/captan-home')
    }
    
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setVehicleColor('')
    setVehiclePlate('')
    setVehicleCapacity('')
    setVehicleType('')
  }

  return (
    <div className='p-5 h-screen flex flex-col justify-between'>
      <div>
      <img className='w-20 mb-2' src="..\uber-driver.svg" />
      <form onSubmit={(e) => {
          submitHandler(e)
        }}>
          <h3 className='text-lg font-medium mb-2'>What's your name?</h3>
          <div className='flex gap-4 mb-5'>
            <input 
              required 
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='First name'
              value={firstName}
              onChange={(e) =>{
                setFirstName(e.target.value)
              }}
            />
            <input 
              required 
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='Last name'
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
              }}
            />
          </div>
          <h3 className='text-lg font-medium mb-2'>What's your email?</h3>
          <input 
            required 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-5 px-4 py-2  w-full text-lg placeholder:text-base'
            type="email" 
            placeholder='email@example.com'
          />
          
          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input 
            required 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-5 px-4 py-2  w-full text-lg placeholder:text-base'
            type="password" 
            placeholder='password'
          />

          <h3 className='text-lg font-medium mb-2'>Vehicle Information</h3>
          <div className='flex gap-4 mb-5'>
            <input 
              required
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='Vehicle Color'
              value={vehicleColor}
              onChange={(e) => {
                setVehicleColor(e.target.value)
              }}
            />
            <input 
              required
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='Vehicle Plate'
              value={vehiclePlate}
              onChange={(e) => {
                setVehiclePlate(e.target.value)
              }}
            />
          </div>
          <div className='flex gap-4 mb-5'>
            <input 
              required
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='Vehicle Capacity'
              value={vehicleCapacity}
              onChange={(e) => {
                setVehicleCapacity(e.target.value)
              }}
            />
            <select 
              required
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              value={vehicleType}
              onChange={(e) => {
                setVehicleType(e.target.value)
              }}
            >
              <option value="" disabled>Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </div>
          <button
            className='bg-[#111] rounded mb-3 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
          >Create Captain Account</button>

          <p className='text-center'>Already have an account? <Link to='/captain-login' className='text-blue-600'> Login here</Link></p>
        </form>
      </div>

      <div>
        <p className='text-[10px] mt-6 leading-tight'>This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service apply</span></p>
      </div>
    </div>
  )
}

export default CaptainSignUp
```
- create another page pages/CaptainHome.jsx and write rfce then click enter
- add the route in Frontend/src/App.jsx
```jsx
        <Route path='/captain-home' element={<CaptainHome />} />
      </Routes>
    </div>
  )
}
```
- add the below code in Frontend/src/pages/CaptainLogin.jsx to integrate captain login route endpoint with react
```jsx
import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'

function CaptainLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const { captain, setCaptain } = useContext(CaptainDataContext)

  const submitHandler = async (e) => {
    e.preventDefault();
    
    const captainData = {
      email: email,
      password: password
    }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, captainData)

    if (response.status === 200) {
      const data = response.data
      setCaptain(data.captain)
      localStorage.setItem('token', data.token)
      navigate('/captain-home')
    }

    setEmail('')
    setPassword('')
  }

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
        <img className='w-20 mb-2' src="..\uber-driver.svg" />
        <form onSubmit={(e) => {
          submitHandler(e)
        }}>
          <h3 className='text-lg font-medium mb-2'>What's your email?</h3>
          <input 
            required 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="email" 
            placeholder='email@example.com'
          />
          
          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input 
            required 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="password" 
            placeholder='password'
          />
          <button
            className='bg-[#111] rounded mb-3 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
          >Login</button>

          <p className='text-center'>Join a fleet? <Link to='/captain-signup' className='text-blue-600'> Register as a captain</Link></p>
        </form>
      </div>

      <div>
        <Link to='/login'
          className='bg-[#cd4204] flex items-center justify-center rounded mb-5 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
        >Sign in as User</Link>
      </div>
    </div>
  )
}

export default CaptainLogin
```
- and to ensure the Capatin Home is only accessed when Captain is logged in, we delete token from dev tools Application then localstorage , since i can still access the captain home page , meaning the captain home page is unprotected so we will use CaptainProtectedWrapper to wrap around the app to get the captain home page protected
- add below code in Frontend/src/pages/CaptainProtectedWrapper.jsx
```jsx
import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'

function CaptainProtectedWrapper({children}) {

  const token = localStorage.getItem('token')
  const navigate = useNavigate()  
  const { CaptainContext, setCaptain } = useContext(CaptainDataContext)

  useEffect(() => {
    if(!token) {
      navigate('/captain-login')
    }
  })

  return (
    <>
      {children}
    </>
  )
}

export default CaptainProtectedWrapper
```
- add and update the CaptainProtectedWrapper elment in the route for captain-home in Frontend/src/App.jsx
```jsx
        <Route path='/captain-home' element={
          <CaptainProtectedWrapper>
            <CaptainHome />
          </CaptainProtectedWrapper>
        } />
      </Routes>
    </div>
  )
}

export default App
```
- now captain-home is protected as after logging in as captain, then deleting token from devtools Application>localStorage (meaning we are logging out) we are redirected to captain-login route
- Here's the problem: token will be made for both the user and the captain, so check if we are getting the correct token, we request data of the captain by using the token , is we get the correct data fron their profile page the we can render the children as it is , in other case if we get an error back, we navigate it back to the captain-login page
- add and update below code in CaptainProtectedWrapper.jsx
```jsx
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'

function CaptainProtectedWrapper({children}) {

  const token = localStorage.getItem('token')
  const navigate = useNavigate()  
  const { CaptainContext, setCaptain } = useContext(CaptainDataContext)
  const [ isLoading, setIsLoading ] = useState(true)

  useEffect(() => {
    if(!token) {
      navigate('/captain-login')
    }
  }, [ token ])

  axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
  }).then(response => {
    if (response.status === 200) {
        setCaptain(response.data.captain)
        setIsLoading(false)
    }
  })
    .catch(err => {
        console.log(err);
        localStorage.removeItem('token')
        navigate('/captain-login')
        
    })

  if (isLoading) {
    return (
        <div>Loading...</div>
    )
  }

  return (
    <>
      {children}
    </>
  )
}

export default CaptainProtectedWrapper
```
- similarly we will do it in the UserProtectedWrapper.jsx as well to enhance the security of the uer in the application
```jsx
import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function UserProtectedWrapper({children}) {

  const token = localStorage.getItem('token')
  const navigate = useNavigate()  
  const { user, setUser } = useContext(UserDataContext)
  const [ isLoading, setIsLoading ] = useState(true)

  useEffect(() => {
    if(!token) {
      navigate('/login')
    }
  }, [ token ])

  axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
  }).then(response => {
    if (response.status === 200) {
        setUser(response.data.captain)
        setIsLoading(false)
    }
  })
    .catch(err => {
        console.log(err);
        localStorage.removeItem('token')
        navigate('/login')
        
    })

  if (isLoading) {
    return (
        <div>Loading...</div>
    )
  }

  return (
    <>
      {children}
    </>
  )
}

export default UserProtectedWrapper
```
- create logout route for captains as well
- create a file Frontend/src/pages/CaptainLogout.jsx
```jsx
import axios from 'axios'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function CaptainLogout() {
    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    axios.get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((response) => {
        if (response.status === 200) {
            localStorage.removeItem('token')
            navigate('/captain-login')
        }
    })

  return (
    <div>CaptainLogout</div>
  )
}

export default CaptainLogout
```
- add the route in Frontend/src/App.jsx
```jsx
        <Route path='/captains/logout' element={
          <CaptainProtectedWrapper>
            <CaptainLogout />
          </CaptainProtectedWrapper>
        } />
      </Routes>
    </div>
  )
}

export default App
```
## Creating User Home Screen UI
- Moved the images from Frontend/public folder to Frontend/src/assets
- make changes in code wherever the images were used
- Create Home UI for user
- add the below code in Frontend/src/pages/Home.jsx
