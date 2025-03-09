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
- Create Home UI for user with two-way binding
- npm i gsap  => provide hooks for moving animations
- npm i @gsap/react 
- RESOURCE: remixicon.com to get arrows
- npm install remixicon --save
- use import 'remixicon/fonts/remixicon.css' in Home.jsx too
- add the below code in Frontend/src/pages/Home.jsx
```jsx
import React, { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel'

function Home() {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef(null)
  const panelCloseRef = useRef(null)

  const submitHandler = (e) => {
    e.preventDefault()
  }

  useGSAP(function () {
    if (panelOpen) {
      gsap.to(panelRef.current, {
        height: '70%',
        padding: 20
        // opacity: 1
      })
      gsap.to(panelCloseRef.current, {
        opacity: 1
      })
    } else {
      gsap.to(panelRef.current, {
        height: '0%',
        padding: 0
        // opacity: 0
      })
      gsap.to(panelCloseRef.current, {
        opacity: 0
      })
    }
  }, [panelOpen])

  return (
    <div className='h-screen relative'>
      <img className='w-16 absolute left-5 top-5' src="../src/assets/1659761100uber-logo-png.png" alt="" />
      <div className='h-screen w-screen'>
        {/* image for temporary use */}
        <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />
      </div>
      <div className=' flex flex-col justify-end h-screen absolute top-0 w-full'>
        <div className='h-[30%] p-6 bg-white relative'>
          <h5 
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false)
            }}
            className='absolute opacity-0 top-4 right-4 text-2xl'>
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className='text-2xl font-semibold'>Find a trip</h4>
          <form onSubmit={(e) => {
            submitHandler(e)
          }}>
            <div className='line absolute h-16 w-1 top-[40%] left-8 bg-gray-800 rounded-full'></div>
            <input 
              onClick={() => {
                setPanelOpen(true)
              }}
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value)
              }}
              className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3' 
              type="text" 
              placeholder='Add a pick-up location' 
            />
            <input 
              onClick={() => {
                setPanelOpen(true)
              }}
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value)
              }}
              className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3' 
              type="text" 
              placeholder='Enter your destination' 
            />
          </form>
        </div>
        <div ref={panelRef} className=' bg-white h-0'> {/* hidden h-0, not hidden h-[70%] */}
              <LocationSearchPanel />
        </div>
      </div>
    </div>
  )
}

export default Home
```

## Completing location search panel UI
- create a folder named components in Frontend/src
- create a file in it Named "LocationSearchPanel.jsx"
- add below code in it and add its element in pages/Home.jsx too
```jsx
import React from 'react'

function LocationSearchPanel() {
  return (
    <div>
        {/* this is just a sample data */}
        <div className='flex gap-4 items-center my-4 justify-start '>
            <h2 className='bg-[#eee] h-10 w-12 flex items-center justify-center rounded-full'><i className="ri-map-pin-2-fill"></i></h2>
            <h4 className='font-medium'>Chhattarpur Mandir, Chhattarpur, New Delhi</h4>
        </div>
        <div className='flex gap-4 items-center my-4 justify-start '>
            <h2 className='bg-[#eee] h-10 w-12 flex items-center justify-center rounded-full'><i className="ri-map-pin-2-fill"></i></h2>
            <h4 className='font-medium'>Chhattarpur Mandir, Chhattarpur, New Delhi</h4>
        </div>
        <div className='flex gap-4 items-center my-4 justify-start '>
            <h2 className='bg-[#eee] h-10 w-12 flex items-center justify-center rounded-full'><i className="ri-map-pin-2-fill"></i></h2>
            <h4 className='font-medium'>Chhattarpur Mandir, Chhattarpur, New Delhi</h4>
        </div>
        <div className='flex gap-4 items-center my-4 justify-start '>
            <h2 className='bg-[#eee] h-10 w-12 flex items-center justify-center rounded-full'><i className="ri-map-pin-2-fill"></i></h2>
            <h4 className='font-medium'>Chhattarpur Mandir, Chhattarpur, New Delhi</h4>
        </div>
    </div>
  )
}

export default LocationSearchPanel
```
- this panel shows if the destination is reachable for not

## Completing User Home UI
- create a hidden panel that shows the opitons of vehicle and their price after destination is selected in Home.jsx
- add overflow hidden in line 41 of Home.jsx to remove LocationSearchPanel as the scrollable part , so it only comes up when clicking the pickup loaction input element
- get INR symbol "₹" from clicking ctrl + alt + 4
- FIX BUG: in the below code, the components always showed border instead of only showing it when i clicked (tried everthing the gave up for the next day)
  <div className='flex border-2 active:border-black rounded-xl mb-2 w-full p-3 items-center justify-between'>
    - Soln: changed the position of active to the code below for it to work properly as i wanted to
    - code:
    <div className='flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between '>

- add the below code in pages/Home.jsx for the vehicle panel & LocationPanel component and its functionality
```jsx
import React, { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel'

function Home() {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef(null)
  const panelCloseRef = useRef(null)
  const vehiclePanelRef = useRef(null)
  const [vehiclePanelOpen, setVehiclePanelOpen] = useState(false)

  const submitHandler = (e) => {
    e.preventDefault()
  }

  useGSAP(function () {
    if (panelOpen) {
      gsap.to(panelRef.current, {
        height: '70%',
        padding: 20
        // opacity: 1
      })
      gsap.to(panelCloseRef.current, {
        opacity: 1
      })
    } else {
      gsap.to(panelRef.current, {
        height: '0%',
        padding: 0
        // opacity: 0
      })
      gsap.to(panelCloseRef.current, {
        opacity: 0
      })
    }
  }, [panelOpen])

  useGSAP(function() {
    if (vehiclePanelOpen) {
      gsap.to(vehiclePanelRef.current, {
        transform: 'translateY(0)'
      })
    }
    else {
      gsap.to(vehiclePanelRef.current, {
        transform: 'translateY(100%)'
      })
    }
  }, [vehiclePanelOpen])

  return (
    <div className='h-screen relative overflow-hidden'>
      <img className='w-16 absolute left-5 top-5' src="../src/assets/1659761100uber-logo-png.png" alt="" />
      <div className='h-screen w-screen'>
        {/* image for temporary use */}
        <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />
      </div>
      <div className=' flex flex-col justify-end h-screen absolute top-0 w-full'>
        <div className='h-[30%] p-6 bg-white relative'>
          <h5 
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false)
            }}
            className='absolute opacity-0 top-4 right-4 text-2xl'>
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className='text-2xl font-semibold'>Find a trip</h4>
          <form onSubmit={(e) => {
            submitHandler(e)
          }}>
            <div className='line absolute h-16 w-1 top-[40%] left-8 bg-gray-800 rounded-full'></div>
            <input 
              onClick={() => {
                setPanelOpen(true)
              }}
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value)
              }}
              className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3' 
              type="text" 
              placeholder='Add a pick-up location' 
            />
            <input 
              onClick={() => {
                setPanelOpen(true)
              }}
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value)
              }}
              className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3' 
              type="text" 
              placeholder='Enter your destination' 
            />
          </form>
        </div>
        <div ref={panelRef} className=' bg-white h-0'> {/* hidden h-0, not hidden h-[70%] */}
              <LocationSearchPanel setPanelOpen={setPanelOpen} setVehiclePanelOpen={setVehiclePanelOpen} />
        </div>
      </div>

      {/* Choose vehicle panel */}
      <div ref={vehiclePanelRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-10 pt-14 rounded-xl translate-y-full'>
        <h5 className='p-1 text-center absolute w-[93%] top-0' onClick={() => {
          setVehiclePanelOpen(false)
        }}>
        <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className='text-2xl font-semibold mb-5 '>Choose a Vehicle</h3>
        
        <div className='flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between '>
            <img className='h-13' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png" alt="" />
                <div className='ml-2 w-1/2'>
                  <h4 className='font-medium text-lg'>UberGo <span><i className="ri-user-3-fill"></i><sub>4</sub></span></h4>
                  <h5 className='font-medium text-sm'>2 mins away</h5>
                  <p className=' text-xs text-gray-600'>Affordable, compact rides</p>
                </div>
                <h2 className='text-lg font-semibold'>₹193.20</h2>
            </div>
            <div className='flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between '>
                <img className='h-13' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png" alt="" />
                <div className=' w-1/2'>
                  <h4 className='font-medium text-lg'>Moto <span><i className="ri-user-3-fill"></i><sub>1</sub></span></h4>
                  <h5 className='font-medium text-sm'>3 mins away</h5>
                  <p className=' text-xs text-gray-600'>Affordable motorcycle rides</p>
                </div>
                <h2 className='text-lg font-semibold'>₹60</h2>
            </div>
            <div className='flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between '>
                <img className='h-15' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,w_956,h_638/v1682350114/assets/c2/296eac-574a-4a81-a787-8a0387970755/original/UberBlackXL.png" alt="" />
                <div className='ml-2 w-1/2'>
                  <h4 className='font-medium text-lg'>Premier <span><i className="ri-user-3-fill"></i><sub>4</sub></span></h4>
                  <h5 className='font-medium text-sm'>4 mins away</h5>
                  <p className=' text-xs text-gray-600'>Affordable, compact rides</p>
                </div>
                <h2 className='text-lg font-semibold'>₹193.20</h2>
            </div>
            <div className='flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between '>
                <img className='h-15' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png" alt="" />
                <div className='ml-2 w-1/2'>
                  <h4 className='font-medium text-lg'>UberAuto <span><i className="ri-user-3-fill"></i><sub>3</sub></span></h4>
                  <h5 className='font-medium text-sm'>2 mins away</h5>
                  <p className=' text-xs text-gray-600'>Affordable auto rides</p>
                </div>
                <h2 className='text-lg font-semibold'>₹119.20</h2>
            </div>
        </div>
    </div>
  )
}

export default Home
```
- add the below code in pages/LocationSearchPanel.jsx
```jsx
import React from 'react'

function LocationSearchPanel(props) {
    console.log(props);
    
    
    // sample array of location
    const locations = [
        'Chhattarpur Mandir, Chhattarpur, New Delhi',
        'DAV, R.K. Puram, New Delhi',
        '7A, Singhania Hotel, Hauz Khas, New Delhi ',
        'Gungnam, Majnu ka tilla, New Delhi'
    ]
  return (
    <div>
        {/* this is just a sample data */}
        {
            locations.map(function(elem, idx) {
                return <div key={idx} onClick={() => {
                    props.setVehiclePanelOpen(true)
                    props.setPanelOpen(false)
                }} className='flex gap-4 border-2 p-3 rounded-xl items-center my-2 justify-start border-gray-100 active:border-black '>
                            <h2 className='bg-[#eee] h-10 w-12 flex items-center justify-center rounded-full'><i className="ri-map-pin-2-fill"></i></h2>
                            <h4 className='font-medium'>{elem}</h4>
                        </div>
            })
        }
        
    </div>
  )
}

export default LocationSearchPanel
```
- create a new file VehiclePanel.jsx in components folder and add the vehiclepanel code from current Home.jsx code in it
- add the below code in Frontend/src/components/VehiclePanel.jsx & do rfce + enter
```jsx
```
- now the code in pages/Home.jsx will look like
```jsx
      {/* Choose vehicle panel */}
      <div ref={vehiclePanelRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-10 pt-14 rounded-xl translate-y-full'>
        <VehiclePanel setVehiclePanelOpen={setVehiclePanelOpen}/>
      </div>
    </div>
  )
}

export default Home
```
- create the file "ConfirmRide.jsx" in folder "pages" 
- add the below code in components/ConfirmedRide.jsx for the details of selected car
```jsx
import React from 'react'

function ConfirmRide(props) {
  return (
    <div>
      <h5 className='p-1 text-center absolute w-[93%] top-0' onClick={() => {
          props.setVehiclePanelOpen(false)
          }}>
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className='text-2xl font-semibold mb-5 '>Confirm your ride</h3>

        <div className='flex gap-2 justify-between items-center flex-col'>
          <img className='h-20' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png" alt="" />
          <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-user-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562/11-A</h3>
                <p className='text-sm -mt-1 text-gray-600'>Kaikondrahalli, Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562/11-A</h3>
                <p className='text-sm -mt-1 text-gray-600'>Kaikondrahalli, Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3'>
              <i className="test-lg ri-wallet-3-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹193.20</h3>
                <p className='text-sm -mt-1 text-gray-600'>Kaikondrahalli, Bengaluru, Karnataka</p>
              </div>
            </div>
          </div>
          <button className='w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'>Confirm</button>
        </div>
    </div>
  )
}

export default ConfirmRide
```

- make changes in pages/Home.jsx
```jsx
import React, { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel'
import VehiclePanel from '../components/VehiclePanel'
import ConfirmRide from '../components/ConfirmRide'

function Home() {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef(null)
  const panelCloseRef = useRef(null)
  const vehiclePanelRef = useRef(null)
  const [vehiclePanelOpen, setVehiclePanelOpen] = useState(false)
  const confirmRidePanelRef = useRef(null)
  const [confirmRidePanel, setConfirmRidePanel] = useState(false)

  const submitHandler = (e) => {
    e.preventDefault()
  }

  useGSAP(function () {
    if (panelOpen) {
      gsap.to(panelRef.current, {
        height: '70%',
        padding: 20
        // opacity: 1
      })
      gsap.to(panelCloseRef.current, {
        opacity: 1
      })
    } else {
      gsap.to(panelRef.current, {
        height: '0%',
        padding: 0
        // opacity: 0
      })
      gsap.to(panelCloseRef.current, {
        opacity: 0
      })
    }
  }, [panelOpen])

  useGSAP(function() {
    if (vehiclePanelOpen) {
      gsap.to(vehiclePanelRef.current, {
        transform: 'translateY(0)'
      })
    }
    else {
      gsap.to(vehiclePanelRef.current, {
        transform: 'translateY(100%)'
      })
    }
  }, [vehiclePanelOpen])

  useGSAP(function() {
    if (confirmRidePanel) {
      gsap.to(confirmRidePanelRef.current, {
        transform: 'translateY(0)'
      })
    }
    else {
      gsap.to(confirmRidePanelRef.current, {
        transform: 'translateY(100%)'
      })
    }
  }, [confirmRidePanel])

  return (
    <div className='h-screen relative overflow-hidden'>
      <img className='w-16 absolute left-5 top-5' src="../src/assets/1659761100uber-logo-png.png" alt="" />
      <div className='h-screen w-screen'>
        {/* image for temporary use */}
        <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />
      </div>
      <div className=' flex flex-col justify-end h-screen absolute top-0 w-full'>
        <div className='h-[30%] p-6 bg-white relative'>
          <h5 
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false)
            }}
            className='absolute opacity-0 top-4 right-4 text-2xl'>
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className='text-2xl font-semibold'>Find a trip</h4>
          <form onSubmit={(e) => {
            submitHandler(e)
          }}>
            <div className='line absolute h-16 w-1 top-[40%] left-8 bg-gray-800 rounded-full'></div>
            <input 
              onClick={() => {
                setPanelOpen(true)
              }}
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value)
              }}
              className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3' 
              type="text" 
              placeholder='Add a pick-up location' 
            />
            <input 
              onClick={() => {
                setPanelOpen(true)
              }}
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value)
              }}
              className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3' 
              type="text" 
              placeholder='Enter your destination' 
            />
          </form>
        </div>
        <div ref={panelRef} className=' bg-white h-0'> {/* hidden h-0, not hidden h-[70%] */}
              <LocationSearchPanel setPanelOpen={setPanelOpen} setVehiclePanelOpen={setVehiclePanelOpen} />
        </div>
      </div>

      {/* Choose vehicle panel */}
      <div ref={vehiclePanelRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-10 pt-12 rounded-xl translate-y-full'>
        <VehiclePanel setConfirmRidePanel={setConfirmRidePanel} setVehiclePanelOpen={setVehiclePanelOpen}/>
      </div>

      {/* Confirmed Ride */}
      <div ref={confirmRidePanelRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 rounded-xl translate-y-full'>
        <ConfirmRide setConfirmRidePanel={setConfirmRidePanel}/>
      </div>
    </div>
  )
}

export default Home
```
- make changes in components/VehiclePanel.jsx
```jsx
import React from 'react'

function VehiclePanel(props) {
  return (
    <div>
        <h5 className='p-1 text-center absolute w-[93%] top-0' onClick={() => {
          props.setVehiclePanelOpen(false)
          }}>
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className='text-2xl font-semibold mb-5 '>Choose a Vehicle</h3>
        
        <div onClick={() => {
            props.setConfirmRidePanel(true)
        }} className='flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between '>
          <img className='h-13' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png" alt="" />
          <div className='ml-2 w-1/2'>
            <h4 className='font-medium text-lg'>UberGo <span><i className="ri-user-3-fill"></i><sub>4</sub></span></h4>
            <h5 className='font-medium text-sm'>2 mins away</h5>
            <p className=' text-xs text-gray-600'>Affordable, compact rides</p>
          </div>
          <h2 className='text-lg font-semibold'>₹193.20</h2>
        </div>
        <div onClick={() => {
            props.setConfirmRidePanel(true)
        }} className='flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between '>
          <img className='h-13' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png" alt="" />
          <div className=' w-1/2'>
            <h4 className='font-medium text-lg'>Moto <span><i className="ri-user-3-fill"></i><sub>1</sub></span></h4>
            <h5 className='font-medium text-sm'>3 mins away</h5>
            <p className=' text-xs text-gray-600'>Affordable motorcycle rides</p>
          </div>
          <h2 className='text-lg font-semibold'>₹60</h2>
        </div>
        <div onClick={() => {
            props.setConfirmRidePanel(true)
        }} className='flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between '>
          <img className='h-15' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,w_956,h_638/v1682350114/assets/c2/296eac-574a-4a81-a787-8a0387970755/original/UberBlackXL.png" alt="" />
          <div className='ml-2 w-1/2'>
            <h4 className='font-medium text-lg'>Premier <span><i className="ri-user-3-fill"></i><sub>4</sub></span></h4>
            <h5 className='font-medium text-sm'>4 mins away</h5>
            <p className=' text-xs text-gray-600'>Affordable, compact rides</p>
          </div>
          <h2 className='text-lg font-semibold'>₹193.20</h2>
        </div>
        <div onClick={() => {
            props.setConfirmRidePanel(true)
        }} className='flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between '>
          <img className='h-15' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png" alt="" />
          <div className='ml-2 w-1/2'>
            <h4 className='font-medium text-lg'>UberAuto <span><i className="ri-user-3-fill"></i><sub>3</sub></span></h4>
            <h5 className='font-medium text-sm'>2 mins away</h5>
            <p className=' text-xs text-gray-600'>Affordable auto rides</p>
          </div>
          <h2 className='text-lg font-semibold'>₹119.20</h2>
        </div>
    </div>
  )
}

export default VehiclePanel
```
- after clicking confirm in ConfirmRide.jsx we need to make a page for the driver to accept the request (named looking for drivers)
- add changes in components/ConfirmRide.jsx
```jsx
import React from 'react'

function ConfirmRide(props) {
  return (
    <div>
      <h5 className='p-1 text-center absolute w-[93%] top-0' onClick={() => {
          props.setConfirmRidePanel(false)
          }}>
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className='text-2xl font-semibold mb-5 '>Confirm your ride</h3>

        <div className='flex gap-2 justify-between items-center flex-col'>
          <img className='h-20' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png" alt="" />
          <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-user-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562/11-A</h3>
                <p className='text-sm -mt-1 text-gray-600'>Kaikondrahalli, Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>98-G</h3>
                <p className='text-sm -mt-1 text-gray-600'>Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3'>
              <i className="test-lg ri-wallet-3-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹193.20</h3>
                <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
              </div>
            </div>
          </div>
          <button onClick={() => {
            props.setVehicleFound(true)
            props.setConfirmRidePanel(false)
          }} className='w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'>Confirm</button>
        </div>
    </div>
  )
}

export default ConfirmRide
```
- create a file components/LookingForDriver.jsx and add the below code in it
```jsx
import React from 'react'

function LookingForDriver(props) {
  return (
    <div>
      <h5 className='p-1 text-center absolute w-[93%] top-0' onClick={() => {
          props.setVehicleFound(false)
          }}>
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className='text-2xl font-semibold mb-5 '>Looking for nearby drivers</h3>

        <div className='flex gap-2 justify-between items-center flex-col'>
          <img className='h-20' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png" alt="" />
          <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-user-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562/11-A</h3>
                <p className='text-sm -mt-1 text-gray-600'>Kaikondrahalli, Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>98-G</h3>
                <p className='text-sm -mt-1 text-gray-600'>Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3'>
              <i className="test-lg ri-wallet-3-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹193.20</h3>
                <p className='text-sm -mt-1 text-gray-600'>Cash cash</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default LookingForDriver
```
- create a file components/WaitingForDriver.jsx and add the below code in it
```jsx
import React from 'react'

function WaitingForDriver(props) {
  return (
    <div>
      <h5 className='p-1 text-center absolute w-[93%] top-0' onClick={() => {
          props.setWaitingForDriver(false)
          }}>
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className='text-2xl font-semibold mb-5 '>Meet at the pickup point</h3>
        <div className='flex items-center justify-between'>
          <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png" alt="" />
          <div className='text-right'>
            <h2 className='text-sm font-medium uppercase text-gray-700 '>Jyotshna</h2>
            <h4 className='text-xl font-semibold uppercase -mt-1 -mb-1'>MP04 JD 9462</h4>
            <p className='text-sm text-gray-600'>Maruti Suzuki Alto K10</p>
          </div>
        </div>

        <div className='flex gap-2 justify-between items-center flex-col'>
          <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-user-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562/11-A</h3>
                <p className='text-sm -mt-1 text-gray-600'>Kaikondrahalli, Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>98-G</h3>
                <p className='text-sm -mt-1 text-gray-600'>Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3'>
              <i className="test-lg ri-wallet-3-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹193.20</h3>
                <p className='text-sm -mt-1 text-gray-600'>Cash cash</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default WaitingForDriver
```
- add the changes in pages/Home.jsx to access "WaitingForDriver" element and "LookingForDriver" element
```jsx
import React, { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel'
import VehiclePanel from '../components/VehiclePanel'
import ConfirmRide from '../components/ConfirmRide'
import LookingForDriver from '../components/LookingForDriver'
import WaitingForDriver from '../components/WaitingForDriver'

function Home() {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef(null)
  const panelCloseRef = useRef(null)
  const vehiclePanelRef = useRef(null)
  const [vehiclePanelOpen, setVehiclePanelOpen] = useState(false)
  const confirmRidePanelRef = useRef(null)
  const [confirmRidePanel, setConfirmRidePanel] = useState(false)
  const vehicleFoundRef = useRef(null)
  const [vehicleFound, setVehicleFound] = useState(false)
  const waitingForDriverRef = useRef(null)
  const [waitingForDriver, setWaitingForDriver] = useState(false)

  const submitHandler = (e) => {
    e.preventDefault()
  }

  useGSAP(function () {
    if (panelOpen) {
      gsap.to(panelRef.current, {
        height: '70%',
        padding: 20
        // opacity: 1
      })
      gsap.to(panelCloseRef.current, {
        opacity: 1
      })
    } else {
      gsap.to(panelRef.current, {
        height: '0%',
        padding: 0
        // opacity: 0
      })
      gsap.to(panelCloseRef.current, {
        opacity: 0
      })
    }
  }, [panelOpen])

  useGSAP(function() {
    if (vehiclePanelOpen) {
      gsap.to(vehiclePanelRef.current, {
        transform: 'translateY(0)'
      })
    }
    else {
      gsap.to(vehiclePanelRef.current, {
        transform: 'translateY(100%)'
      })
    }
  }, [vehiclePanelOpen])

  useGSAP(function() {
    if (confirmRidePanel) {
      gsap.to(confirmRidePanelRef.current, {
        transform: 'translateY(0)'
      })
    }
    else {
      gsap.to(confirmRidePanelRef.current, {
        transform: 'translateY(100%)'
      })
    }
  }, [confirmRidePanel])

  useGSAP(function() {
    if (vehicleFound) {
      gsap.to(vehicleFoundRef.current, {
        transform: 'translateY(0)'
      })
    }
    else {
      gsap.to(vehicleFoundRef.current, {
        transform: 'translateY(100%)'
      })
    }
  }, [vehicleFound])

  useGSAP(function() {
    if (waitingForDriver) {
      gsap.to(waitingForDriverRef.current, {
        transform: 'translateY(0)'
      })
    }
    else {
      gsap.to(waitingForDriverRef.current, {
        transform: 'translateY(100%)'
      })
    }
  }, [waitingForDriver])

  return (
    <div className='h-screen relative overflow-hidden'>
      <img className='w-16 absolute left-5 top-5' src="../src/assets/1659761100uber-logo-png.png" alt="" />
      <div className='h-screen w-screen'>
        {/* image for temporary use */}
        <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />
      </div>
      <div className=' flex flex-col justify-end h-screen absolute top-0 w-full'>
        <div className='h-[30%] p-6 bg-white relative'>
          <h5 
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false)
            }}
            className='absolute opacity-0 top-4 right-4 text-2xl'>
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className='text-2xl font-semibold'>Find a trip</h4>
          <form onSubmit={(e) => {
            submitHandler(e)
          }}>
            <div className='line absolute h-16 w-1 top-[40%] left-8 bg-gray-800 rounded-full'></div>
            <input 
              onClick={() => {
                setPanelOpen(true)
              }}
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value)
              }}
              className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3' 
              type="text" 
              placeholder='Add a pick-up location' 
            />
            <input 
              onClick={() => {
                setPanelOpen(true)
              }}
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value)
              }}
              className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3' 
              type="text" 
              placeholder='Enter your destination' 
            />
          </form>
        </div>
        <div ref={panelRef} className=' bg-white h-0'> {/* hidden h-0, not hidden h-[70%] */}
              <LocationSearchPanel setPanelOpen={setPanelOpen} setVehiclePanelOpen={setVehiclePanelOpen} />
        </div>
      </div>

      {/* Choose vehicle panel */}
      <div ref={vehiclePanelRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-10 pt-12 rounded-xl translate-y-full'>
        <VehiclePanel setConfirmRidePanel={setConfirmRidePanel} setVehiclePanelOpen={setVehiclePanelOpen}/>
      </div>

      {/* Confirmed Ride */}
      <div ref={confirmRidePanelRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 rounded-xl translate-y-full'>
        <ConfirmRide setConfirmRidePanel={setConfirmRidePanel} setVehicleFound={setVehicleFound}/>
      </div>

      {/* Looking for nearby drivers, vehicle found */}
      <div ref={vehicleFoundRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 rounded-xl translate-y-full'>
        <LookingForDriver setVehicleFound={setVehicleFound}/>
      </div>

      {/* Waiting for the driver*/}
      <div ref={waitingForDriverRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 rounded-xl'>
        <WaitingForDriver setWaitingForDriver={setWaitingForDriver}/>
      </div>
    </div>
  )
}

export default Home
```
- NOTE: I feel like LookingForDriver page is unneccessary if i'm wrong i will update this line else i'll deploy it as is. And there is no way i can access the WaitingForDriver panel rn
- create a file pages/Riding.jsx to track the riding and rfce then enter
- add the route for Riding in App.jsx as well
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
import UserLogout from './pages/UserLogout'
import CaptainHome from './pages/CaptainHome'
import CaptainProtectedWrapper from './pages/CaptainProtectedWrapper'
import CaptainLogout from './pages/CaptainLogout'
import Riding from './pages/Riding'

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
        <Route path='/users/logout' element={
          <UserProtectedWrapper>
            <UserLogout />
          </UserProtectedWrapper>
        } />
        <Route path='/riding' element={
          <UserProtectedWrapper>
            <Riding />
          </UserProtectedWrapper>
        } />
        <Route path='/captain-home' element={
          <CaptainProtectedWrapper>
            <CaptainHome />
          </CaptainProtectedWrapper>
        } />
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
- add the below code in Riding.jsx
```jsx
import React from 'react'
import { Link } from 'react-router-dom'

function Riding() {
  return (
    <div className='h-screen'>
        <Link to='/home' className='fixed h-10 w-10 right-2 top-2 bg-white flex items-center justify-center rounded-full'>
            <i className="text-lg font-medium ri-home-5-line"></i>
        </Link>
        <div className='h-1/2'>
            <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />

        </div>
        <div className='h-1/2 p-4'>
            <div className='flex items-center justify-between'>
                <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png" alt="" />
                <div className='text-right'>
                    <h2 className='text-sm font-medium uppercase text-gray-700 '>Jyotshna</h2>
                    <h4 className='text-xl font-semibold uppercase -mt-1 -mb-1'>MP04 JD 9462</h4>
                    <p className='text-sm text-gray-600'>Maruti Suzuki Alto K10</p>
                </div>
            </div>

        <div className='flex gap-2 justify-between items-center flex-col'>
          <div className='w-full mt-5'>
            
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>98-G</h3>
                <p className='text-sm -mt-1 text-gray-600'>Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3'>
              <i className="test-lg ri-wallet-3-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹193.20</h3>
                <p className='text-sm -mt-1 text-gray-600'>Cash cash</p>
              </div>
            </div>
          </div>
        </div>
            <button className='w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'>Make a Payment</button>
        </div>
    </div>
  )
}

export default Riding
```

## Create Captain Home UI
- not able to continue captain login after 7 secs
the bug :
```jsx
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
  ```
- BUG FIX soln 
- in Frontend/src/pages/CaptainProtectedWrapper.jsx
```jsx
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'

function CaptainProtectedWrapper({children}) {

  const token = localStorage.getItem('token')
  const navigate = useNavigate()  
  const { captain, setCaptain } = useContext(CaptainDataContext)
  const [ isLoading, setIsLoading ] = useState(true)

  useEffect(() => {
    if(!token) {
      navigate('/captain-login')
    }
    axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, { //this was the bug soln where it loggedin only for 7 secs
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
  
  }, [ token ])

  
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
- add the pages/CaptainHome.jsx
```jsx
import React from 'react'
import { Link } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'

function CaptainHome() {
  return (
    <div className='h-screen'>
        <div className='fixed p-3 top-0 flex items-center justify-between w-full'>
          <img className='w-16' src="../src/assets/uber-driver.svg" alt="" />
          <Link to='/captains/logout' className='h-10 w-10 bg-white flex items-center justify-center rounded-full'>
              <i className="text-lg font-medium ri-logout-box-r-line"></i>
          </Link>
        </div>
        <div className='h-2/3'>
            <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />

        </div>
        <div className='h-1/3 p-4 rounded-t-xl'>
            <CaptainDetails />
        </div>
    </div>
  )
}

export default CaptainHome
```
- create a file components/CaptainDetails.jsx
```jsx
import React from 'react'

function CaptainDetails() {
  return (
    <div>
        <div className='flex items-center justify-between'>
              <div className='flex items-center justify-start gap-3'>
                <img className='h-10 w-10 rounded-full object-cover' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlv0zjWmdsmjxIL4cE-qpaLi-6F89HJ_JiKw&s" alt="" />
                <h4 className='text-lg font-medium'>Anvi Chahar</h4>
              </div>
              <div className='text-right'>
                <h3 className='text-lg font-semibold'>₹298.57</h3>
                <p className='text-sm text-gray-600 left-0'>Earned</p>
              </div>
            </div>
            <div className='flex p-4 mt-3 bg-gray-100 rounded-xl justify-center gap-5 items-start'>
              <div className='text-center'>
                <i className="font-thin mb-2 text-gray-400 text-3xl ri-time-line"></i>
                <h5 className='text-lg font-medium mb-2 mt-2'>10.2</h5>
                <p className='text-xs text-gray-400 uppercase'>Hours online</p>
              </div>
              <div className='text-center'>
                <i className="font-thin mb-2 text-gray-400 text-3xl ri-speed-up-line"></i>
                <h5 className='text-lg font-medium mb-2 mt-2'>30 KM</h5>
                <p className='text-xs text-gray-400 uppercase'>Total distance</p>
              </div>
              <div className='text-center'>
                <i className="font-thin mb-2 text-gray-400 text-3xl ri-booklet-line"></i>
                <h5 className='text-lg font-medium mb-2 mt-2'>24</h5>
                <p className='text-xs text-gray-400 uppercase'>Total jobs</p>
              </div>
            </div>
    </div>
  )
}

export default CaptainDetails
```
- adding request accept pop-up/panel 
- create file components/RidePopUp.jsx
```jsx
import React from 'react'

function RidePopUp(props) {
  return (
    <div className='bg-gray-100 p-4 rounded-2xl'>
        <h5 className='p-1 text-center absolute w-[93%] top-0' onClick={() => {
            props.setRidePopUpPanel(false)
          }}>
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className='text-2xl font-semibold mb-5 '>New Ride Available!</h3>
        <div className='flex items-center justify-between mt-3 p-3 bg-blue-200 rounded-lg'>
            <div className='flex items-center gap-3'>
            <img className='h-12 w-12 rounded-full object-cover' src="https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?q=80&w=932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            <h2 className='text-lg font-medium'>Deepshah Rajput</h2>
            </div>
            <h5 className='text-lg font-semibold'>2.2 KM</h5>
        </div>
        
        <div className='flex gap-2 justify-between items-center flex-col'>
          <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-user-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562/11-A</h3>
                <p className='text-sm -mt-1 text-gray-600'>Kaikondrahalli, Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>98-G</h3>
                <p className='text-sm -mt-1 text-gray-600'>Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3'>
              <i className="test-lg ri-wallet-3-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹193.20</h3>
                <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-between mt-5'>
            <button onClick={() => {
              props.setRidePopUpPanel(false)
            }} className=' bg-gray-100 text-gray-600 font-semibold p-3 px-8 rounded-lg'>Ignore</button>
            <button onClick={() => {
              props.setConfirmRidePopUpPanel(true)
            }} className=' bg-green-600 text-white font-semibold p-3 px-8 rounded-lg'>Accept</button>
           
          </div>
        </div>
    </div>
  )
}

export default RidePopUp
```
- add the below code in pages/CaptainHome.jsx
```jsx
import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'

function CaptainHome() {

  const [ridePopUpPanel, setRidePopUpPanel] = useState(true)
  const ridePopUpPanelRef = useRef(null)
  const [confirmRidePopUpPanel, setConfirmRidePopUpPanel] = useState(false)
  const confirmRidePopUpPanelRef = useRef(null)

  useGSAP(function() {
    if (ridePopUpPanel) {
      gsap.to(ridePopUpPanelRef.current, {
        transform: 'translateY(0)'
      })
    }
    else {
      gsap.to(ridePopUpPanelRef.current, {
        transform: 'translateY(100%)'
      })
    }
  }, [ridePopUpPanel])

  useGSAP(function() {
    if (confirmRidePopUpPanel) {
      gsap.to(confirmRidePopUpPanelRef.current, {
        transform: 'translateY(0)'
      })
    }
    else {
      gsap.to(confirmRidePopUpPanelRef.current, {
        transform: 'translateY(100%)'
      })
    }
  }, [confirmRidePopUpPanel])

  return (
    <div className='h-screen'>
        <div className='fixed p-3 top-0 flex items-center justify-between w-full'>
          <img className='w-16' src="../src/assets/uber-driver.svg" alt="" />
          <Link to='/captains/logout' className='h-10 w-10 bg-white flex items-center justify-center rounded-full'>
              <i className="text-lg font-medium ri-logout-box-r-line"></i>
          </Link>
        </div>
        <div className='h-2/3'>
            <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />

        </div>
        <div className='h-1/3 p-4 rounded-t-xl'>
            <CaptainDetails />
        </div>
        <div ref={ridePopUpPanelRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 rounded-xl translate-y-full'>
          <RidePopUp setRidePopUpPanel={setRidePopUpPanel} setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} />
        </div>
        <div ref={confirmRidePopUpPanelRef} className='fixed h-screen w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 rounded-xl translate-y-full'>
          <ConfirmRidePopUp setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} setRidePopUpPanel={setRidePopUpPanel} />
        </div>
    </div>
  )
}

export default CaptainHome
```
- create a file components/ConfirmRidePopUp.jsx
```jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function ConfirmRidePopUp(props) {

    const [otp, setOtp] = useState('')

    const submitHandler = (e) => {
        e.preventDefault()
    }
  return (
    <div>
        <h5 className='p-1 text-center absolute w-[93%] top-0' onClick={() => {
            props.setConfirmRidePopUpPanel(false)
          }}>
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className='text-2xl font-semibold mb-5 '>Confirm this ride to Start</h3>
        <div className='flex items-center justify-between mt-3 p-3 bg-blue-200 rounded-lg'>
            <div className='flex items-center gap-3'>
            <img className='h-12 w-12 rounded-full object-cover' src="https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?q=80&w=932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            <h2 className='text-lg font-medium'>Deepshah Rajput</h2>
            </div>
            <h5 className='text-lg font-semibold'>2.2 KM</h5>
        </div>
        
        <div className='flex gap-2 justify-between items-center flex-col'>
          <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-user-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562/11-A</h3>
                <p className='text-sm -mt-1 text-gray-600'>Kaikondrahalli, Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>98-G</h3>
                <p className='text-sm -mt-1 text-gray-600'>Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3'>
              <i className="test-lg ri-wallet-3-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹193.20</h3>
                <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
              </div>
            </div>
          </div>
          {/* Confirm OTP */}

          <div className='mt-6 w-full'>
            <form onSubmit={(e) => {
                submitHandler(e)
            }}>
                <input value={otp} onChange={(e) => setOtp(e.target.value)} type="text" className='bg-[#eee] px-6 py-4 text-lg rounded-lg w-full mt-3 font-mono' placeholder='Enter OTP'/>
                <Link to='/captain-riding' className='w-full mt-5 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg'>Confirm</Link>
                <button onClick={() => {
                    props.setConfirmRidePopUpPanel(false)
                    props.setRidePopUpPanel(false)
                }} className='w-full mt-1 bg-red-700 text-lg text-white font-semibold p-3 rounded-lg'>Cancel</button>
            </form>
          </div>
        </div>
    </div>
  )
}

export default ConfirmRidePopUp
```
- add the /captain-riding route in App.jsx
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
import UserLogout from './pages/UserLogout'
import CaptainHome from './pages/CaptainHome'
import CaptainProtectedWrapper from './pages/CaptainProtectedWrapper'
import CaptainLogout from './pages/CaptainLogout'
import Riding from './pages/Riding'
import CaptainRiding from './pages/CaptainRiding'

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
        <Route path='/users/logout' element={
          <UserProtectedWrapper>
            <UserLogout />
          </UserProtectedWrapper>
        } />
        <Route path='/riding' element={
          <UserProtectedWrapper>
            <Riding />
          </UserProtectedWrapper>
        } />
        <Route path='/captain-home' element={
          <CaptainProtectedWrapper>
            <CaptainHome />
          </CaptainProtectedWrapper>
        } />
        <Route path='/captains/logout' element={
          <CaptainProtectedWrapper>
            <CaptainLogout />
          </CaptainProtectedWrapper>
        } />
        <Route path='/captain-riding' element={
          <CaptainProtectedWrapper>
            <CaptainRiding />
          </CaptainProtectedWrapper>
        } />
      </Routes>
    </div>
  )
}

export default App
```
- create a file pages/CaptainRiding.jsx
```jsx
import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

function CaptainRiding(props) {
    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const finishRidePanelRef = useRef(null)
  
    useGSAP(function() {
      if (finishRidePanel) {
        gsap.to(finishRidePanelRef.current, {
          transform: 'translateY(0)'
        })
      }
      else {
        gsap.to(finishRidePanelRef.current, {
          transform: 'translateY(100%)'
        })
      }
    }, [finishRidePanel])

  return (
    <div className='h-screen'>
        <div className='fixed p-3 top-0 flex items-center justify-between w-full'>
          <img className='w-16' src="../src/assets/uber-driver.svg" alt="" />
          <Link to='/captains/logout' className='h-10 w-10 bg-white flex items-center justify-center rounded-full'>
              <i className="text-lg font-medium ri-logout-box-r-line"></i>
          </Link>
        </div>
        <div className='h-4/5'>
            <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />

        </div>
        <div className='h-1/5 p-6 flex items-center justify-between bg-yellow-400 relative'
        onClick={()=>{
            setFinishRidePanel(true)
        }}>
            <h5 className='p-1 text-center absolute w-[95%] top-0' onClick={() => {
                props.setFinishRidePanel(false)
            }}>
            <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
            </h5>
            <h4 className='text-xl font-semibold'>1.6 KM away</h4>
            <button className=' bg-green-600 text-white font-semibold p-3 px-8 rounded-lg'>Complete Ride</button>
        </div>
        <div ref={finishRidePanelRef} className='fixed h-screen w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 rounded-xl translate-y-full'>
          <FinishRide setFinishRidePanel={setFinishRidePanel}/>
        </div>
        
    </div>
  )
}

export default CaptainRiding
```
- add import 'remixicon/fonts/remixicon.css' in App.jsx
- create a file components/FinishRide.jsx
```jsx
import React from 'react'
import { Link } from 'react-router-dom'

function FinishRide(props) {
  return (
    <div>
        <h5 className='p-1 text-center absolute w-[93%] top-0' onClick={() => {
            props.setFinishRidePanel(false)
          }}>
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className='text-2xl font-semibold mb-5 '>Finish this Ride</h3>
        <div className='flex items-center justify-between mt-3 p-4 border-2 border-yellow-400 rounded-lg'>
            <div className='flex items-center gap-3'>
            <img className='h-12 w-12 rounded-full object-cover' src="https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?q=80&w=932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            <h2 className='text-lg font-medium'>Deepshah Rajput</h2>
            </div>
            <h5 className='text-lg font-semibold'>2.2 KM</h5>
        </div>
        
        <div className='flex gap-2 justify-between items-center flex-col'>
          <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-user-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562/11-A</h3>
                <p className='text-sm -mt-1 text-gray-600'>Kaikondrahalli, Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>98-G</h3>
                <p className='text-sm -mt-1 text-gray-600'>Bengaluru, Karnataka</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3'>
              <i className="test-lg ri-wallet-3-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹193.20</h3>
                <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
              </div>
            </div>
          </div>
          {/* Confirm OTP */}

          <div className='mt-6 w-full'>

                <Link to='/captain-home' className='w-full mt-5 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg'>Finish Ride</Link>
               
               <p className='mt-10 text-xs'>Click on finish ride button if you have completed the payment</p>
          </div>
        </div>
    </div>
  )
}

export default FinishRide
```

## Enabling Google Maps API
- npm i axios
- use google maps api key in .env as GOOGLE_MAPS_API= 
- create a file Backend/services/maps.service.js
```js
import axios from 'axios'

export const getAddressCoordinate = async (address) => {
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        constresponse = await axios.get(url);
        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }


}
```

- create a file for routes Backend/routes/maps.route.js
```js
import { Router } from "express";
import { authUser } from '../middleware/auth.middleware.js'
import { getCoordinates } from "../controllers/maps.controller.js";
import { query } from "express-validator";


const router = Router()

router.get('/get-coordinates', 
    query('address').isString().isLength({ min: 3 }),
    authUser, getCoordinates)

export default router;
```

- create a file controller for maps controllers/maps.controller.js
```js
import { validationResult } from "express-validator";
import { getAddressCoordinate } from "../services/maps.service";

export const getCoordinates = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }


    const { address } = req.query;

    try {
        const coordinates = await getAddressCoordinate(address);
        res.status(200).json(coordinates);
    }
    catch (error) {
        res.status(404).json({ message: 'Coordinates not found'});
    }
}
```
- add the below code in Backend/app.js
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
import captainRouter from './routes/captain.route.js'
import mapsRouter from './routes/maps.route.js'

app.use("/users", userRouter)
app.use("/captains", captainRouter)
app.use("/maps", mapsRouter)

export {app}
```
- 
- use postman to check the routes for following
  1. get the lat & lng of the address=sheriyans coding school indrapuri   => in params of GET {{server}}/maps/get-coordinates and use header "Authorization" with "bearer <token>" with token of a user get get when we login or register as user (above code for this)
  2. get the distance & time to cover that between to points GET http method and have params as origin & destination for distance and time taken to calculate , add origin and destination in the place of params and change th eroute to /get-distance-time (below code for this)
  
- add the below code in maps.route.js
```js
import { Router } from "express";
import { authUser } from '../middleware/auth.middleware.js'
import { getCoordinates, getDistanceTime } from "../controllers/maps.controller.js";
import { query } from "express-validator";


const router = Router()

router.get('/get-coordinates', 
    query('address').isString().isLength({ min: 3 }),
    authUser, getCoordinates)

router.get('/get-distance-time', 
    query('origin').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    authUser,
    getDistanceTime
)

export default router;
```
- add the below code in maps.service.js
```js
import axios from 'axios'

export const getAddressCoordinate = async (address) => {
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        constresponse = await axios.get(url);
        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }


}

export const getDistance_Time = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required')
    }

    const apiKey = process.env.GOOGLE_MAPS_API;

    const url = `https://maps.google.com/maps/api/distancematrix/json?origin=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`

    try {

        const response = await axios.get(url);
        if (response.data.status === 'OK') {

            if (response.data.rows[ 0 ].elements[ 0 ].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }

            return response.data.rows[ 0 ].elements[ 0 ];
        }
        else {
            throw new Error('Unable to fetch distance and time');
        }
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
```
- add the below code in maps.controller.js
```js
import { validationResult } from "express-validator";
import { getAddressCoordinate, getDistance_Time } from "../services/maps.service.js";

export const getCoordinates = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }


    const { address } = req.query;

    try {
        const coordinates = await getAddressCoordinate(address);
        res.status(200).json(coordinates);
    }
    catch (error) {
        res.status(404).json({ message: 'Coordinates not found'});
    }
}

export const getDistanceTime = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { origin, destination } = req.query;

        const distanceTime = await getDistance_Time(origin, destination);

        res.status(200).json(distanceTime);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error'});
    }
}
```
- 3. get the suggestions when we put in a location, add /get-suggestions in route then add input=sheriyan in params then send  (below code for this)

- add the below code in maps.route.js
```js
import { Router } from "express";
import { authUser } from '../middleware/auth.middleware.js'
import { getCoordinates, getDistanceTime, getAutoCompleteSuggestions } from "../controllers/maps.controller.js";
import { query } from "express-validator";


const router = Router()

router.get('/get-coordinates', 
    query('address').isString().isLength({ min: 3 }),
    authUser, getCoordinates)

router.get('/get-distance-time', 
    query('origin').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    authUser,
    getDistanceTime
)

router.get('/get-suggestions', 
    query('input').isString().isLength({ min: 3 }),
    authUser,
    getAutoCompleteSuggestions
)

export default router;
```
- add the below code in maps.service.js
```js
import axios from 'axios'

export const getAddressCoordinate = async (address) => {
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        constresponse = await axios.get(url);
        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }


}

export const getDistance_Time = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required')
    }

    const apiKey = process.env.GOOGLE_MAPS_API;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`

    try {

        const response = await axios.get(url);
        if (response.data.status === 'OK') {

            if (response.data.rows[ 0 ].elements[ 0 ].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }

            return response.data.rows[ 0 ].elements[ 0 ];
        }
        else {
            throw new Error('Unable to fetch distance and time');
        }
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

export const getSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required')
    }

    const apiKey = process.env.GOOGLE_MAPS_API;

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data.predictions.map(prediction => prediction.description).filter(value => value);
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}
```
- add the below code in maps.controller.js
```js
import { validationResult } from "express-validator";
import { getAddressCoordinate, getDistance_Time, getSuggestions } from "../services/maps.service.js";

export const getCoordinates = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }


    const { address } = req.query;

    try {
        const coordinates = await getAddressCoordinate(address);
        res.status(200).json(coordinates);
    }
    catch (error) {
        res.status(404).json({ message: 'Coordinates not found'});
    }
}

export const getDistanceTime = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { origin, destination } = req.query;

        const distanceTime = await getDistance_Time(origin, destination);

        res.status(200).json(distanceTime);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error'});
    }
}

export const getAutoCompleteSuggestions = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { input } = req.query;

        const suggestions = await getSuggestions(input);

        res.status(200).json(suggestions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error'});
    }
}
```

## Creating rides in Backend
- 