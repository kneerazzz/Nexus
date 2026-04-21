import ImageModel from "../models/image.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.util.js"
import ActivityService from "../services/activity.service.js"

const getAllImages = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access");
    }
    const images = await ImageModel.findAll(user.id);
    return res
    .status(200)
    .json(
        new ApiResponse(200, { images }, "Images fetched successfully!")
    )
})

const getImage = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access");
    }
    const { id } = req.params;
    if(!id){
        throw new ApiError(400, "Missing required fields");
    }
    const image = await ImageModel.findById(id, user.id);
    if(!image){
        throw new ApiError(404, "Image not found!")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { image }, "Image fetched successfully!")
    )
})

const uploadImage = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access");
    }
    const { title } = req.body;
    if(!title){
        throw new ApiError(400, "Missing required fields")
    }
    const file = req.file;
    if(!file){
        throw new ApiError(400, "No file uploaded")
    }
    const result = await uploadToCloudinary(file.buffer, {
        folder: 'nexus/images',
        resource_type: 'image',
        public_id: `${Date.now()}_${file.originalname}`
    })
    const imageId = await ImageModel.create({
        user_id: user.id,
        title: title,
        file_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        file_size: file.size
    });
    const image = await ImageModel.findById(imageId, user.id);
    if(!image){
        throw new ApiError(500, "Internal server error");
    }

    ActivityService.log({
        user_id: user.id,
        action: 'UPLOAD_IMAGE',
        entity_type: 'image',
        entity_id: imageId,
        metadata: { title, file_type: file.mimetype}
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, { image }, "Image uploaded successfully!")
    )
})

const updateImage = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const { id } = req.params;
    const { title } = req.body;

    if(!id || !title){
        throw new ApiError(400, "Missing required fields");
    }

    const image = await ImageModel.findById(id, user.id);
    if(!image){
        throw new ApiError(404, "Image not found!");
    }
    await ImageModel.update({
        title: title,
        id,
        user_id: user.id
    })
    const updatedImage = await ImageModel.findById(id, user.id);
    if(!updatedImage){
        throw new ApiError(500, "Internal server error");
    }

    ActivityService.log({
        user_id: user.id,
        action: 'UPDATE_IMAGE',
        entity_type: 'image',
        entity_id: id
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, { image: updatedImage }, "Image updated successfully!")
    )
})

const deleteImage = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const { id } = req.params;
    if(!id){
        throw new ApiError(400, "Missing required fields");
    }
    const image = await ImageModel.findById(id, user.id);
    if(!image){
        throw new ApiError(404, "Image not found!");
    }
    await deleteFromCloudinary(image.public_id, 'image');
    await ImageModel.delete({
        id: id,
        user_id: user.id
    })
    ActivityService.log({
        user_id: user.id,
        action: 'DELETE_IMAGE',
        entity_type: 'image',
        entity_id: id
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Image deleted successfully!")
    )
})

export {
    getAllImages,
    getImage,
    uploadImage,
    updateImage,
    deleteImage
}