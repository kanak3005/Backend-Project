import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


// Local system me temporarily save hui file ko Cloudinary par upload karna aur upload successful hone par uski information return karna.

    cloudinary.config({ //Cloudinary ko login karao.
        cloud_name: process.env.CLOUDNARY_CLOUD_NAME,  //Ye tumhara Cloudinary account ka naam hota hai.
        api_key: process.env.CLOUDNARY_API_KEY, // ye public identifier h - Cloudinary ko pata chal jata hai Kis developer ne request bheji hai.
        api_secret: process.env.CLOUDNARY_API_SECRET 
    });

    const uploadOnCloudinary = async(localFilePath) => {
        try{ // cloudinary - upload fail bhi ho skta h isliye we use try catch
           if(!localFilePath) return null;
           // upload the file on cloudinary
           const response = await cloudinary.uploader.upload(localFilePath,
             {resource_type: "auto"}
        )
       // console.log("Response", response)
        // file has been uploaded on cloudinary
      //  console.log("File uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
      return response;
    }
        catch(error){
      fs.unlinkSync(localFilePath);// delete the file from locally saved temporary file as the operation got failed
        return null;
    }
}

// Purana file (avatar/coverImage) Cloudinary se delete karne ke liye.
// Hume sirf URL store karte hai, public_id nahi — isliye URL se hi public_id nikal rahe hai.
const deleteFromCloudinary = async(fileUrl) => {
    try{
        if(!fileUrl) return null;
        // Cloudinary URL kuch aisa dikhta h:
        // https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/abc123xyz.jpg
        // Hume sirf last part chahiye "abc123xyz" (extension ke bina) - yehi public_id hai
        const urlParts = fileUrl.split("/")
        const fileNameWithExtension = urlParts[urlParts.length - 1] // "abc123xyz.jpg"
        const publicId = fileNameWithExtension.split(".")[0] // "abc123xyz"

        const response = await cloudinary.uploader.destroy(publicId)
        return response
    } catch(error){
        console.log("Error while deleting file from cloudinary", error)
        return null
    }
}
    export {uploadOnCloudinary, deleteFromCloudinary}
