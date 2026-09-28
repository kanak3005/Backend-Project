import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

//verifyJWT ka kaam hai: Check karna ki request bhejne wala user actually logged-in/authenticated hai ya nahi.

export const verifyJWT = asyncHandler(async(req, _, next) => {
try{
    const token = req.cookies?.accessToken || req.header
("Authorization")?.replace("Bearer ", "")

if(!token){
    throw new ApiError(401, "Unauthorized request")
}
// jwt(Header.Payload.Signature) verify - Login ke time server ne token generate kiya tha using a secret.
// Ab middleware check karta hai:
// "Kya ye token genuinely mere server ne generate kiya tha aur valid hai?"

const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
// ye decoded token -> agra token valid h toh ye token ka payload return krega
// For example token banate waqt payload kuch aisa ho sakta hai:
// {
//     _id: user._id,
//     email: user.email
// }

// Then verify ke baad:
// decodedToken conceptually:
// {
//     _id: "64abc123...",
//     email: "kanak@gmail.com"
// }
const user = await User.findById(decodedToken?._id) //Ab hum token ke andar mili _id se database mein user find kar rahe hai
.select("-password -refreshToken")//User data lao, but password aur refreshToken mat lao.

if(!user){
    throw new ApiError(401, "Invalid ACCESS TOKEN")
}
// Middleware ne authenticated user ko request object ke andar store kar diya.
// req
//  ├── body
//  ├── params
//  ├── headers
//  ├── cookies
//  └── user       ← humne add kiya
req.user = user; // req.user mein authenticated user mil jayega.

next() //Authentication successful. Ab request ko aage bhejo.

}catch(error){ //Agar try ke andar kahin error aa gaya: toh catch block execute hoga 
    throw new ApiError(401, error?.message ||  "Invalid accessToken")
}

})

export const verifyJWTIfPresent = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        return next()
    }

    let decodedToken
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch {
        return next()
    }

    if (!decodedToken?._id) {
        return next()
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken")

    if (user) {
        req.user = user
    }

    return next()


})
// Optional auth: token ho aur valid ho to req.user set kar do, warna user ko GUEST maan ke aage badh jao.
// verifyJWT ki tarah 401 NAHI dega - isliye public routes (jaise watch page) par safely laga sakte hai.
export const optionalVerifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (token) {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
            if (user) {
                req.user = user
            }
        }
    } catch (error) {
        // token expired / invalid hai - koi baat nahi, guest ki tarah treat karo
    }
    next() // next() try ke bahar hai, taaki aage ke handlers ke errors yahan swallow na ho
})