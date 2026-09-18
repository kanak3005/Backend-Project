import { Router } from 'express';
// Router() Express ka mini-router banata hai.
// Isse hum comments ke saare routes ek separate file mein manage kar sakte hain.

import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js" //verifyJWT check karta hai ki user logged in hai ya nahi.
 
const router = Router(); //Yahaan router ek object hai jisme hum routes define karenge.
// router.use(verifyJWT) hata diya — comments padhna (GET) ab public hai,
// sirf add/update/delete (likhna) ke liye login chahiye.

router
.route("/:videoId") //Is route ka common path hai: /:videoId - : ka matlab hai dynamic parameter. eg - /api/v1/comments/64abc123
.get(getVideoComments) //Public: Given video ke saare comments fetch karna.
.post(verifyJWT, addComment);//Protected: Given video par naya comment add karna.

router
.route("/c/:commentId") //Yahaan commentId kisi specific comment ki ID hai.
.delete(verifyJWT, deleteComment) //Protected: Specific comment ko delete karna (owner-only check controller ke andar hai).
.patch(verifyJWT, updateComment); //Protected: Specific comment ka content update karna.

export default router