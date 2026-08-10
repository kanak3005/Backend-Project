class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message) // Error(message) ko call karo isme message stack name sab initialize ho jaate h 

        this.statusCode = statusCode
        this.data = null // data ke andar actual information hoti h user ki age , name, email, address etc. & agar error h to data null hota h
        this.message = message
        this.success = false // agar error h to success kabhi true nhi hogi
        this.errors = errors

        if (stack) { // agar stack pass kiya h to usse use karo, warna Error.captureStackTrace() use karo
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }//Ye automatically ek stack trace generate karta hai jo batata hai error kaha se aaya (kis function se, kis file se) — debugging ke liye bahut useful hai.
        
        //Error.captureStackTrace() -
// Ye Node.js ka function hai. Ye automatically likhta hai
// Error
// ↓
// controller
// ↓
// service
// ↓
// app.js
// Agar ye line nahi hoti to debugging mushkil ho jati.
    }
}

export { ApiError }