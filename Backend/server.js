import dotenv from "dotenv"
dotenv.config({ path: './.env'})
import connectDB from './db/db.js'
import {app} from './app.js'

const port = process.env.PORT || 3000

connectDB();

app.on("error", (error) => {
    console.log("ERRR:", error);
    throw error
})
app.listen(port, () => {
    console.log(`Server is running at port : ${port}`)
})