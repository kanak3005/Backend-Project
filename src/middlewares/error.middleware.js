import { ApiError } from "../utils/ApiError.js"

// Express ke default error handler HTML page bhejta hai, JSON nahi.
// Ye middleware har thrown error (ApiError ho ya koi normal JS error) ko
// ek consistent JSON shape { success, message, errors, data } me convert karke bhejta hai.
// IMPORTANT: ye app.js me sabse LAST me register hona chahiye (saare routes ke baad).
const errorHandler = (err, req, res, next) => {
    let error = err

    // Terminal me actual error print karo - taaki dev machine par debug karna aasan ho
    console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err)

    // Agar error ApiError instance nahi hai (jaise koi Mongoose/JWT/unexpected error),
    // to usse bhi ApiError ke shape me convert kar do taaki response consistent rahe.
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500
        const message = error.message || "Something went wrong"
        error = new ApiError(statusCode, message, error?.errors || [], err.stack)
    }

    const response = {
        success: false,
        message: error.message,
        errors: error.errors,
        data: error.data,
        // stack sirf development me bhejo, production me nahi (security ke liye)
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    }

    return res.status(error.statusCode).json(response)
}

export { errorHandler }