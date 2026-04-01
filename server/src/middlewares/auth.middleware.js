import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from "../config/env.js";
import { ApiError } from '../utils/apiError.js';
import UserModel from '../models/user.model.js';

const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || 
                      req.headers["authorization"]?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized — no token");
        }

        let decoded;
        try {
            decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        } catch (error) {
            throw new ApiError(401, "Unauthorized — invalid token");
        }

        const user = await UserModel.findByIdWithPassword(decoded.id);
        if (!user) {
            throw new ApiError(401, "Unauthorized — user not found");
        }

        req.user = user;
        next();

    } catch (error) {
        next(error); 
    }
}

export default protect;