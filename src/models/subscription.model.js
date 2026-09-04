import mongoose, {Schema} from 'mongoose';
const subscriptionSchema = new Schema({
    //ObjectId → kis document ki ID hai
    //ref → kis Model/collection mein us ID ko dhundhna hai
subscriber: {
    type: Schema.Types.ObjectId, // one who is subscribing(jo kisi channel ko subscribe kar raha hai.)
    ref: "User"
},
channel:{
    type: Schema.Types.ObjectId,
    // one to whom 'subscriber' is subscribing for eg - subscriber = Kanak
    // channel = TechWithABC
    ref: "User"
}
},{timestamps: true}) 

//subscriptionSchema ke basis par Subscription naam ka Mongoose model bana do.
export const Subscription = mongoose.model("Subscription", subscriptionSchema)
//Schema
//   ↓
// Structure/rules define karta hai

// Model
//   ↓
// Database ke saath kaam karne ke methods deta hai 
//aab hum Subscription.create(...), Subscription.find(...) etc. use kar sakte hai