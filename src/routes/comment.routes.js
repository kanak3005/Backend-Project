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

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
//Iski wajah se ye sab routes protected hain: Get comments, Add comment, Update comment, delete comment
router
.route("/:videoId") //Is route ka common path hai: /:videoId - : ka matlab hai dynamic parameter. eg - /api/v1/comments/64abc123
.get(getVideoComments) //Given video ke saare comments fetch karna.
.post(addComment);//Given video par naya comment add karna.

router
.route("/c/:commentId") //Yahaan commentId kisi specific comment ki ID hai.
.delete(deleteComment) //Specific comment ko delete karna.
.patch(updateComment); //Specific comment ka content update karna.

export default router