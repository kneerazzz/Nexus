import UserModel from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await UserModel.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found");
        }
        const accessToken = UserModel.generateAccessToken(user);
        const refreshToken = UserModel.generateRefreshToken(user);
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Internal server error");
    }
}

const register = asyncHandler(async (req, res) => {
    const { name, username, email, password } = req.body;
    if(!name || !username || !email || !password) {
        throw new ApiError(400, "Missing required fields");
    }

    const existingEmail = await UserModel.findByEmail(email);
    const existingUsername = await UserModel.findByUsername(username);
    if(existingEmail || existingUsername){
        throw new ApiError(400, "User with this email or username already exists");
    }
    const userId = await UserModel.create({ name, username, email, password });
    const user = await UserModel.findById(userId);
    const registeredUser = {
        name: user.name,
        username: user.username,
        email: user.email
    }
    if(!registeredUser){
        throw new ApiError(500, "Internal server error")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id);

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, {
        ...options,
        maxAge: 24 * 60 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json( new ApiResponse(200, { user: registeredUser }, "Account Created Successfully!"))
})



const login = asyncHandler(async(req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        throw new ApiError(400, "Missing required fields")
    }
    const user = await UserModel.findByEmail(email);
    if(!user){
        throw new ApiError(400, "Invalid credentials")
    }
    const isPasswordCorrect = await UserModel.isPasswordCorrect(password, user.password);
    if(!isPasswordCorrect){
        throw new ApiError(401, "Incorrect Password")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id);
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    const loggedInUser = {
        username: user.username,
        name: user.name,
        email: user.email
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, {
        ...options,
        maxAge: 24 * 60 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json(
        new ApiResponse(200, { user: loggedInUser }, "Login Successful!")
    )
})


const logout = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user) {
        throw new ApiError(401, "Unauthorized request");
    }
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout Successful!"))
})

const getUserDetails = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const userDetails = {
        username: user.username,
        name: user.name,
        email: user.email
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, { user: userDetails }, "User details fetched successfully!")
    )
})


const updateUserDetails = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }

    const { name, username, email } = req.body;

    if(!username && !name && !email){
        throw new ApiError(400, "Nothing to update here")
    }

    if(username && username !== user.username) {
        const taken = await UserModel.findByUsername(username);
        if(taken){
            throw new ApiError(409, "username already taken")
        }
    }
    if(email && email !== user.email) {
        const taken = await UserModel.findByEmail(email);
        if(taken) {
            throw new ApiError(409, "email already taken")
        }
    }

    const updatedRows = await UserModel.updateUserDetails(
        {
            name: name || user.name,
            username: username || user.username,
            email: email  || user.email,
            id: user.id
        }
    );
    if(!updatedRows){
        throw new ApiError(500, "Internal server error")
    }
    const updatedUser = await UserModel.findById(user.id);
    if(!updatedUser){
        throw new ApiError(500, "Internal server error")
    }
    const updatedUserDetails = {
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, { user: updatedUserDetails }, "User details updated successfully!")
    )
})

const updatePassword = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const { oldPassword, newPassword } = req.body;
    if(!oldPassword || !newPassword){
        throw new ApiError(400, "Missing required fields")
    }

    const isPasswordCorrect = await UserModel.isPasswordCorrect(oldPassword, user.password);
    if(!isPasswordCorrect){
        throw new ApiError(401, "Incorrect Password")
    }
    const updatedRows = await UserModel.updatePassword( { password: newPassword, id: user.id } );

    if(!updatedRows){
        throw new ApiError(500, "Internal server error")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password updated successfully!")
    )
})

const deleteUser = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }
    const { password } = req.body;
    if(!password){
        throw new ApiError(400, "Missing required fields")
    }
    const isPasswordCorrect = await UserModel.isPasswordCorrect(password, user.password);
    if(!isPasswordCorrect){
        throw new ApiError(401, "Incorrect Password")
    }
    const deletedRows = await UserModel.delete(user.id);
    if(!deletedRows){
        throw new ApiError(500, "Internal server error")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "User deleted successfully!")
    )
})


export {
    register,
    login,
    logout,
    getUserDetails,
    updateUserDetails,
    updatePassword,
    deleteUser
}
