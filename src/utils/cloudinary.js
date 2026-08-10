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
        // file has been uploaded on cloudinary
        console.log("File uploaded on cloudinary", response.url);
        return response;
    }
        catch(error){
      fs.unlinkSync(localFilePath);// delete the file from locally saved temporary file as the operation got failed
        return null;
    }
}
    export {uploadOnCloudinary}
