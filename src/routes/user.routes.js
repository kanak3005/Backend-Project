import { Router } from 'express';
import {
    loginUser, logoutUser, registerUser, changePassword,
    getCurrentUser, updateAccountDetails, updateUserAvatar, 
    updateUserCoverImage, getUserChannelProfile, getWatchHistory
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { refreshAccessToken } from '../controllers/user.controller.js';

//Ye user.routes.js file decide karti hai ki /register request aane par pehle Multer chalega aur uske baad registerUser controller chalega.
//Kis URL par kaunsa middleware aur kaunsa controller execute hoga, ye decide karna.
const router = Router();
router.route("/register").post(
    upload.fields([ //"Multer, registration request mein mujhe multiple types ki files milengi." Aur woh files hain:  avatar,coverImage
//Mujhe 2 file fields chahiye:
// 1. avatar → max 1
// 2. coverImage → max 1

        {
            name: "avatar",
            maxCount: 1
        },
        {
           name: "coverImage",
           maxCount: 1

        }
    ]),
    registerUser) //Jab /register par POST request aaye, pehle upload.fields() execute karo, uske baad registerUser execute karo.
router.route("/login").post(loginUser)
// secured route 
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changePassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(getUserChannelProfile)
router.route("/watch-history").get(verifyJWT, getWatchHistory)

 export default router;