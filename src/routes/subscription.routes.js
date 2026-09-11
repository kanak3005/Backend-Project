import { Router } from "express"
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

// Apply JWT authentication to all routes
router.use(verifyJWT)


// Get all subscribers of a channel
// POST → Subscribe / Unsubscribe to a channel
router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription)


// Get all channels subscribed by a user
router
    .route("/u/:subscriberId")
    .get(getSubscribedChannels)


export default router
// complete flow
// GET  /c/:channelId
//      ↓
// getUserChannelSubscribers
//      ↓
// "Is channel ko kaun-kaun subscribe karta hai?"


// POST /c/:channelId
//      ↓
// toggleSubscription
//      ↓
// "Subscribe / Unsubscribe"


// GET  /u/:subscriberId
//      ↓
// getSubscribedChannels
//      ↓
// "Ye user kin channels ko subscribe karta hai?"