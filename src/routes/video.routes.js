import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"

import {verifyJWT, optionalVerifyJWT} from "../middlewares/auth.middleware.js"  // ek hi import line - dono ek saath
import {upload} from "../middlewares/multer.middleware.js"  //upload ka use files/images/videos receive karne ke liye hota hai.

const router = Router(); //Ab router ke andar hum video ke routes define karenge.
// router.use(verifyJWT) hata diya — ab sirf write/action routes par verifyJWT lagayenge,
// taaki koi bhi (bina login) videos browse/watch kar sake, jaise YouTube par hota hai.

router
    .route("/") // actual route - /api/v1/videos/
    .get(getAllVideos) //Public: Jab client videos GET kare, getAllVideos controller chalao.
    .post( //Protected: Ye video publish/upload karne ke liye hai.
        verifyJWT,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo //Multer files receive karne ke baad request ko controller tak bhejta hai.
    );

router
    .route("/:videoId") //Yahan :videoId dynamic parameter hai. (SIRF EK BAAR define karo)
    .get(optionalVerifyJWT, getVideoById)  //Public playback; valid session ho to req.user attach hota hai (watch history ke liye).
    .delete(verifyJWT, deleteVideo) //Protected: Specific video delete karo (owner-only check controller ke andar hai).
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo); // Protected: PATCH ka use existing video ko update karne ke liye hai.

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus); // Protected: sirf owner publish/unpublish kar sake.

export default router

//Router
//  ├── GET    /                         → getAllVideos
//  ├── POST   /                         → publishAVideo
//  ├── GET    /:videoId                 → getVideoById (optional auth)
//  ├── PATCH  /:videoId                 → updateVideo
//  ├── DELETE /:videoId                 → deleteVideo
//  └── PATCH  /toggle/publish/:videoId  → togglePublishStatus