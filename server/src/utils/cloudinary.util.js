import { v2 as cloudinary } from 'cloudinary'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY } from '../config/env.js'

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
})


const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto', ...options },
            (error, result) => {
                if(error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
}

const deleteFromCloudinary = async(publicId, resourceType = 'raw') => {
    try {
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        console.log("File removed from cloudinary!");
        return response;
    } catch (error) {
        console.log('Error removing file from cloudinary:', error);
        return null;
    }
}

export { uploadToCloudinary, deleteFromCloudinary }