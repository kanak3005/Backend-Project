import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express() 
app.use(cors({ // cors means - main iss origin se aani wali request ko allow krta hu baaki sab blocked krdo || app.use(cors()) - sabhi origin ko allow krdo except which is not good for production
    origin: process.env.CORS_ORIGIN,
    credentials: true //  Credentials: Cookies | Authorization headers | Sessions - without this browser will not send cookies in cross-origin requests. So, if you want to send cookies in cross-origin requests, you need to set this option to true.
}))
app.use(express.json({limit: "16kb"})) // Client jo JSON bhejta hai, express.json() usse JavaScript object me convert karta hai.
//express.json() is a built-in Express middleware that parses incoming JSON request bodies and makes the parsed data available in req.body.
app.use(express.urlencoded({extended: true, limit: "16kb"})) // special characters ko encoded krta hai url ke andar - " " -> + , %20 etc & extended: true means - nested objects ko bhi parse krta hai. eg - { user: { name: "John", age: 30 } } ko parse krke req.body me store krta hai.
app.use(express.static("public")) // Static matlab --jo files directly browser ko deni hain. eg - public folder ke andr jo files h - logo.png, favicon.ico, robots.txt, style.css, script.js etc. wo directly browser ko serve karne ke liye static folder me rakhe jate hain.
app.use(cookieParser()) // Browser se aane wali raw cookie string ko parse karke JavaScript object me convert karna aur req.cookies me store kar dena.
// raw string - Cookie: token=abc123; username=kanak  --> app.use(cookieParser()) --> {
//     token: "abc123",
//     username: "kanak"
// }

// Cookie browser ke paas hoti hai.
// Session server ke paas hota hai.

// routes
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//routes declaration 
app.use("/api/v1/users", userRouter) ///api/v1/users se start hone wali requests ko userRouter ke paas bhejo.
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
//  /user -> ke baad jo bhi methods likhe jayenge vo sab routes.js m likhenge
// http://localhost:8000/api/v1/users - jaise hi humne /users likha aab saara control userRouter ke pass (user.routes.js ) chla jayega vha /register - > ke baad registerUser method chlega
// http://localhost:8000/api/v1users/register
//  http://localhost:8000/api/v1/users/login - bar bar import krne ki need nhi app.js same hi rhega bss user.routes m jaake register ki jgh login ayega but humne login function bnaya nhi h ye bss eg tha
export { app }
