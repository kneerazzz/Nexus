import DocumentModel from "../models/document.model.js";
import ActivityService from "../services/activity.service.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.util.js";

const extractText = (buffer, mimetype) => {
    if(mimetype == 'text/plain'){
        return buffer.toString('utf-8');
    }
    return null;
}

const getAllDocuments = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user) {
        throw new ApiError(401, "Unauthorized access")
    }
    const documents = await DocumentModel.findAll(user.id);
    return res
    .status(200)
    .json(
        new ApiResponse(200, { documents }, "Documents fetched successfully!")
    )
})

const getDocument = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access");
    }
    const { id } = req.params;
    if(!id){
        throw new ApiError(400, "Missing required fields");
    }
    const document = await DocumentModel.findById(id, user.id);
    if(!document){
        throw new ApiError(404, "Document not found!");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { document }, "Document fetched successfully!")
    )
})

const uploadDocument = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const { title, description } = req.body;
    if(!title){
        throw new ApiError(400, "Missing required fields");
    }
    if(!req.file){
        throw new ApiError(400, "No file uploaded")
    }
    const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'nexus/documents',
        resource_type: 'raw',
        public_id: `${Date.now()}_${req.file.originalname}`
    })
    const content = extractText(req.file.buffer, req.file.mimetype);

    const docId = await DocumentModel.create({
        user_id: user.id,
        title: title,
        description: description || null,
        file_url: result.secure_url,
        public_id: result.public_id,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        content,
    })

    const document = await DocumentModel.findById(docId, user.id);
    if(!document){
        throw new ApiError(500, "Internal server error");
    }
    ActivityService.log({
        user_id: user.id,
        action: 'UPLOAD_DOCUMENT',
        entity_type: 'document',
        entity_id: docId,
        metadata: { title, file_type: req.file.mimetype}
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, { document }, "Document uploaded")
    )
})

const updateDocument = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const { id } = req.params;
    const { title, description } = req.body;
    if(!id){
        throw new ApiError(400, "Missing Document Id!")
    }
    if(!title && !description){
        throw new ApiError(400, "Missing required fields")
    }
    const document = await DocumentModel.findById(id, user.id);
    if(!document){
        throw new ApiError(404, "Document not found!");
    }
    await DocumentModel.update({
        title: title || document.title,
        description: description || document.description,
        id,
        user_id: user.id
    })
    const updated = await DocumentModel.findById(id, user.id);
    if(!updated){
        throw new ApiError(500, "Internal server error");
    }

    ActivityService.log({
        user_id: user.id,
        action: 'UPDATE_DOCUMENT',
        entity_type: 'document',
        entity_id: id
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, { document: updated },  "Document updated successfully!")
    )
})


const deleteDocument = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const { id } = req.params;

    if(!id){
        throw new ApiError(400, "Missing Document Id!");
    }
    const document = await DocumentModel.findById(id, user.id);
    if(!document){
        throw new ApiError(404, "Document not found!");
    }
    await deleteFromCloudinary(document.public_id, 'raw');
    await DocumentModel.delete({id, user_id: user.id});

    ActivityService.log({
        user_id: user.id,
        action: 'DELETE_DOCUMENT',
        entity_type: 'document',
        entity_id: id
    })
    

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Document deleted successfully!")
    )
})

const getVersions = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user) {
        throw new ApiError(401, "Unauthorized access")
    }
    const { id } = req.params;
    if(!id){
        throw new ApiError(400, "Missing required fields")
    }
    const document = await DocumentModel.findById(id, user.id);
    if(!document){
        throw new ApiError(404, "Document not found!")
    }

    const versions = await DocumentModel.getVersions(id);
    return res
    .status(200)
    .json(
        new ApiResponse(200, { versions }, "Document versions fetched successfully!")
    )
})

const uploadVersion = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user) {
        throw new ApiError(401, "Unauthorized access");
    }
    const { id } = req.params;
    const { change_note } = req.body;
    
    if(!req.file){
        throw new ApiError(400, "No file uploaded");
    }
    const document = await DocumentModel.findById(id, user.id);
    if(!document){
        throw new ApiError(404, "Document not found!");
    }
    const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'nexus/documents/versions',
        resource_type: 'raw',
        public_id: `${Date.now()}_v_${req.file.originalname}`
    });
    const latestVersion = await DocumentModel.getLatestVersionNum(id);

    const versionId = await DocumentModel.createVersion({
        document_id: id,
        version_num: latestVersion + 1,
        file_url: result.secure_url,
        public_id: result.public_id,
        file_size: req.file.size,
        change_note: change_note || null
    })
    if(!versionId){
        throw new ApiError(500, "Internal server error");
    }
    const versions = await DocumentModel.getVersions(id);
    return res
    .status(200)
    .json(
        new ApiResponse(200, { versions }, "Document version uploaded successfully!")
    )
})

const searchDocuments = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access");
    }
    const { q } = req.query;
    if(!q){
        throw new ApiError(400, "Search Query is required!");
    }
    const documents = await DocumentModel.search({query: q, user_id: user.id});

    return res
    .status(200)
    .json(
        new ApiResponse(200, { documents }, "Documents fetched successfully!")
    )
})


export {
    getAllDocuments,
    getDocument,
    uploadDocument,
    updateDocument,
    deleteDocument,
    getVersions,
    uploadVersion,
    searchDocuments
}