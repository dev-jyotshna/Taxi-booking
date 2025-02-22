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

app.use("/users", userRouter)
app.use("/captains", captainRouter)

export {app}