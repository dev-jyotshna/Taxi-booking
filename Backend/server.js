import dotenv from "dotenv"
dotenv.config({ path: './.env'})
import connectDB from './db/db.js'
import {app} from './app.js'
import { initializeSocket } from "./socket.js"
import { createServer } from "http";

const server = createServer(app)

const port = process.env.PORT || 3000

connectDB();

initializeSocket(server)

server.on("error", (error) => {
    console.log("ERRR:", error);
    throw error
})
server.listen(port, () => {
    console.log(`Server is running at port : ${port}`)
})