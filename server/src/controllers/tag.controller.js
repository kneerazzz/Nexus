import TagModel from "../models/tag.model.js"
import ImageModel from "../models/image.model.js"
import DocumentModel from "../models/document.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const getAllTags = asyncHandler(async(req, res) => {
    const tags = await TagModel.findAll();
    return res
    .status(200)
    .json(
        new ApiResponse(200, { tags }, "Tags fetched successfully!")
    )
})

const getTag = asyncHandler(async(req, res) => {
    const { id } = req.params;
    if(!id){
        throw new ApiError(400, "Missing required fields")
    }
    const tag = await TagModel.findById(id);
    if(!tag){
        throw new ApiError(404, "Tag not found!")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { tag }, "Tag fetched successfully!")
    )
})

const getTagByName = asyncHandler(async(req, res) => {
    const { name } = req.params;
    if(!name){
        throw new ApiError(400, "Missing required fields")
    }
    const tag = await TagModel.findByName(name);
    if(!tag){
        throw new ApiError(404, "Tag not found!")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { tag }, "Tag fetched successfully!")
    )
})

const createTag = asyncHandler(async(req, res) => {
    const {name, color} = req.body;
    if(!name){
        throw new ApiError(400, "Missing required fields")
    }
    const existing = await TagModel.findByName(name);
    if(existing){
        throw new ApiError(400, "Tag already exists!")
    }
    const tagId = await TagModel.create({name, color});
    const tag = await TagModel.findById(tagId);

    if(!tag){
        throw new ApiError(500, "Internal server error");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { tag }, "Tag created successfully!")
    )
})

const updateTag = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const { name, color } = req.body;

    if(!id || !name){
        throw new ApiError(400, "Missing required fields")
    }
    const tag = await TagModel.findById(id);
    if(!tag){
        throw new ApiError(404, "Tag not found!");
    }
    await TagModel.update({name, color, id});
    const updatedTag = await TagModel.findById(id);
    if(!updatedTag){
        throw new ApiError(500, "Internal server error");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { tag: updatedTag }, "Tag updated successfully!" )
    )
})

const deleteTag = asyncHandler(async(req, res) => {
    const { id } = req.params;
    if(!id){
        throw new ApiError(400, "Missing required fields")
    }
    const tag = await TagModel.findById(id);
    if(!tag){
        throw new ApiError(404, "Tag not found!")
    }
    await TagModel.delete(id);
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Tag deleted successfully!")
    )
})


const addTagToDocument = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const { documentId, tagId } = req.params;
    if(!documentId || !tagId){
        throw new ApiError(400, "Missing required fields")
    }
    const document = await DocumentModel.findById(documentId, user.id);
    if(!document){
        throw new ApiError(404, "Document not found!");
    }

    const tag = await TagModel.findById(tagId);
    if(!tag){
        throw new ApiError(404, "Tag not found!");
    }
    await TagModel.addToDocument({document_id: documentId, tag_id: tagId});

    const updatedDocument = await DocumentModel.findById(documentId, user.id);
    if(!updatedDocument){
        throw new ApiError(500, "Internal server error");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { document: updatedDocument }, "Tag added to document successfully!")
    )
})

const removeTagFromDocument = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const { documentId, tagId } = req.params;
    if(!documentId || !tagId){
        throw new ApiError(400, "Missing required fields")
    }
    const document = await DocumentModel.findById(documentId, user.id);
    if(!document){
        throw new ApiError(404, "Document not found!");
    }
    const tag = await TagModel.findById(tagId);
    if(!tag){
        throw new ApiError(404, "Tag not found!");
    }
    await TagModel.removeFromDocument({document_id: documentId, tag_id: tagId});
    const updatedDocument = await DocumentModel.findById(documentId, user.id);
    if(!updatedDocument){
        throw new ApiError(500, "Internal server error!")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { document: updatedDocument }, "Tag removed from document!")
    )
})

const addTagToImage = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const { imageId, tagId } = req.params;
    if(!imageId || !tagId){
        throw new ApiError(400, "Missing required fields")
    }
    const image = await ImageModel.findById(imageId, user.id);
    if(!image){
        throw new ApiError(404, "Image not found!");
    }

    const tag = await TagModel.findById(tagId);
    if(!tag){
        throw new ApiError(404, "Tag not found!");
    }
    await TagModel.addToImage({image_id: imageId, tag_id: tagId});

    const updatedImage = await ImageModel.findById(imageId, user.id);
    if(!updatedImage){
        throw new ApiError(500, "Internal server error");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { image: updatedImage }, "Tag added to image successfully!")
    )
})

const removeTagFromImage = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const { imageId, tagId } = req.params;
    if(!imageId || !tagId){
        throw new ApiError(400, "Missing required fields")
    }
    const image = await ImageModel.findById(imageId, user.id);
    if(!image){
        throw new ApiError(404, "Image not found!");
    }

    const tag = await TagModel.findById(tagId);
    if(!tag){
        throw new ApiError(404, "Tag not found!");
    }
    await TagModel.removeFromImage({image_id: imageId, tag_id: tagId});

    const updatedImage = await ImageModel.findById(imageId, user.id);
    if(!updatedImage){
        throw new ApiError(500, "Internal server error");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { image: updatedImage }, "Tag removed from image!")
    )
})


export {
    getAllTags,
    getTag,
    getTagByName,
    createTag,
    updateTag,
    deleteTag,
    addTagToDocument,
    removeTagFromDocument,
    addTagToImage,
    removeTagFromImage
}