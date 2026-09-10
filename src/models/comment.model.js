import mongoose, {Schema} from 'mongoose';
import mongooseAggreratePaginate from
 'mongoose-aggregate-paginate-v2';


 //Comment
// ├── content  → comment kya hai
// ├── video    → kis video par comment hai
// └── owner    → kis user ne comment kiya
const commentSchema = new Schema( //Ek Comment document ke andar kaun-kaun se fields honge aur unka data type kya hoga.
    {
        content: {
            type: String,
            required: true
        },
         video:{
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
        {
            timestamps: true //Mongoose automatically do fields add karega: updated at , comment at
        }
    
)
commentSchema.plugin(mongooseAggreratePaginate)
export const Comment = mongoose.model("Comment", commentSchema)