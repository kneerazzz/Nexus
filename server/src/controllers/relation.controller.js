import RelationModel from "../models/relation.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import DocumentModel from "../models/document.model.js";
import ImageModel from "../models/image.model.js";

const verifyEntity = async(type, id, userId) => {
    if(type === 'document'){
        const doc = await DocumentModel.findById(id, userId);
        if(!doc){
            throw new ApiError(404, "Document not found!")
        }
        return doc;
    }
    if(type === 'image'){
        const image = await ImageModel.findById(id, userId);
        if(!image){
            throw new ApiError(404, "Image not found!")
        }
        return image;
    }
    throw new ApiError(400, "Invalid entity");
}

const getRelations = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access");
    }
    const { type, id } = req.params;
    if(!type || !id){
        throw new ApiError(400, "Missing required fields")
    }
    if(type !== 'document' && type !== 'image'){
        throw new ApiError(400, "Type must be document or image");
    }
    await verifyEntity(type, id, user.id);
    const relations = await RelationModel.findAllForEntity( {type, id});
    return res
    .status(200)
    .json(
        new ApiResponse(200, { relations }, "Relations fetched successfully!")
    )
})

const createRelation = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access");
    }
    const { source_type, source_id, target_type, target_id, relation_label } = req.body;
    if(!source_type || !source_id || !target_type || !target_id){
        throw new ApiError(400, "Missing required fields");
    }
    if(source_type === target_type && source_id === target_id){
        throw new ApiError(400, "Cannot create a relation with itself");
    }
    await verifyEntity(source_type, source_id, user.id);
    await verifyEntity(target_type, target_id, user.id);

    const duplicate = await RelationModel.findDuplicate({
        source_type,
        source_id, 
        target_type,
        target_id
    })
    if(duplicate){
        throw new ApiError(409, "Relation already exists");
    }
    const relationId = await RelationModel.create({
        source_type,
        source_id,
        target_type,
        target_id,
        relation_label
    })

    const relation = await RelationModel.findById(relationId);
    if(!relation){
        throw new ApiError(500, "Internal server error");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { relation }, "Relation created successfully!")
    )
})

const deleteRelation = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access");
    }
    const { id } = req.params;
    if(!id){
        throw new ApiError(400, "Missing required fields");
    }
    const relation = await RelationModel.findById(id);
    if(!relation){
        throw new ApiError(404, "Relation not found!");
    }
    await RelationModel.delete(id);
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Relation deleted successfully!")
    ) 
})

export {
    getRelations,
    createRelation,
    deleteRelation
}