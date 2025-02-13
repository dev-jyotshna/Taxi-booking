import dotenv from "dotenv"
dotenv.config({ path: './.env'})
// import http from "http"
import {app} from './app.js'

const port = process.env.PORT || 3000

app.on("error", (error) => {
    console.log("ERRR:", error);
    throw error
})
app.listen(port, () => {
    console.log(`Server is running at port : ${port}`)
})