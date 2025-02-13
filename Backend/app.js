import express from "express"
const app = express()

app.get('/', (res, req) => {
    res.send('Hello World')
})
export {app}