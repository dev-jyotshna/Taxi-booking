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
    
        if (!isUserAlreadyExist) {
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
    
        if (!isUserAlreadyExist) {
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
    
        if (!isUserAlreadyExist) {
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

    if (!isCaptainAlreadyExist) {
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