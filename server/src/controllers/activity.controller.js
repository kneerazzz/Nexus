import ActivityModel from "../models/activity.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getActivityLogs = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access");
    }
    const logs = await ActivityModel.findByUser(user.id);

    return res
    .status(200)
    .json(
        new ApiResponse(200, { logs }, "Activity fetched successfully!")
    )
})

export {
    getActivityLogs
}