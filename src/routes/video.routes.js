import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"

import {verifyJWT} from "../middlewares/auth.middleware.js"  //User logged in/authenticated hai ya nahi?
import {upload} from "../middlewares/multer.middleware.js"  //upload ka use files/images/videos receive karne ke liye hota hai.

const router = Router(); //Ab router ke andar hum video ke routes define karenge.
router.use(verifyJWT); // Is file ke saare routes par verifyJWT middleware apply karo.

router
    .route("/") // actual route - /api/v1/videos/
    .get(getAllVideos) //Jab client videos GET kare, getAllVideos controller chalao. for eg - GET /api/v1/videos/
    .post( //Ye video publish/upload karne ke liye hai.
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
    .route("/:videoId") //Yahan :videoId dynamic parameter hai.
    .get(getVideoById)  //Specific video ki information lao.
    .delete(deleteVideo) //Specific video delete karo.
    .patch(upload.single("thumbnail"), updateVideo); // PATCH ka use existing video ko update karne ke liye hai.

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router

//Router
//  ├── GET    /                         → getAllVideos
//  ├── POST   /                         → publishAVideo
//  ├── GET    /:videoId                 → getVideoById
//  ├── PATCH  /:videoId                 → updateVideo
//  ├── DELETE /:videoId                 → deleteVideo
//  └── PATCH  /toggle/publish/:videoId  → togglePublishStatus