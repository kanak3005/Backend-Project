//Wrapper Function for async functions to handle errors in Express.jsj


// Normally Express sirf synchronous errors ko automatically catch karta hai.
// Lekin: async|await|Promise
// ke errors Express khud catch nahi karta.
// Isliye hume likhna padta hai

//Ye requestHandler kya hai?--> Ye actual controller function hai.jiske andr asyn code - try/catch block likha hai. Eg - loginUser, registerUser, getUserProfile, updateUserProfile etc. Ye controller function hi requestHandler ban jayega.
//Example: const loginUser = async(req,res)=>{ ... }
// To
// loginUser hi requestHandler ban jayega.

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)) // Promise.resolve() karta kya hai? Ye kisi bhi value ko Promise bana deta hai. agar already promise h to vhi return kar deta hai. Agar value promise nahi h to usse resolve karke promise return kar deta hai.
            .catch((err) => next(err));
    };
};

export { asyncHandler };






// const asyncHandler = (fn) => {
//     return async (req,res,next) => {
//     }
// }
// iski short form is - const asyncHandler = (fn) => async (req,res,next) => {}
// const asyncHandler = (fn) => async(req,res,next) => {
//   try{
//    await fn(req, res, next)
//   } catch(error) {
//      res.status(error.code || 500).json({
//      success: false,
//      message: err.message
//      })
//   }
// }