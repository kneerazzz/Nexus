import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY } from '../config/env.js'

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
})

function extractPublicId(cloudinarUrl) {
    const urlParts = cloudinarUrl.split("/")
    const fileName = urlParts.pop().split(".")[0]
    const folderPath = urlParts.slice(urlParts.indexOf("upload") + 1).join("/")
    return `${folderPath}/${fileName}`
}

const uploadOnCloudinary = async(localFilePath) => {
    try {
        const response = await cloudinary.uploader
            .upload(localFilePath, {
                resource_type: 'auto'
            })
        console.log("File uploaded!");
        fs.unlinkSync(localFilePath);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("Error uploading file to cloudinary: ", error);
        return null;
    }
}

const deleteFromCloudinary = async(url) => {
    try {
        const publicId = extractPublicId(url);
        const response = await cloudinary.uploader
            .destroy(publicId, {
                resource_type: "auto"
        })
        console.log("File removed!")
        return response;
        
    } catch (error) {
        console.log('Error removing files from cloudinary ', error);
        return null
    }
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}