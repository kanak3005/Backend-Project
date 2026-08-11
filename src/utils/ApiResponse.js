// ApiError → Jab request fail ho.
// ApiResponse → Jab request successful ho.
// Sabse pehle ye class kyun banayi?
// Maan lo tumhare project me 50 APIs hain.
// Without ApiResponse, har jagah aise likhna padega:
// res.status(200).json({
//     success: true,
//     message: "User fetched successfully",
//     data: user
// }); 2,3...n sabke liye alagalag api bnai pdengi

// JavaScript bol raha hai
// "Main ek blueprint bana raha hoon."
// Jaise ek builder ghar banane ka map (blueprint) banata hai.
// Waise hi class object banane ka blueprint hoti hai.
class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}
export {ApiResponse}