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
import { User } from "../models/user.model";

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

