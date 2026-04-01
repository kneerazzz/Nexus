import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/env.js";

const UserModel = {
    async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM Users WHERE email = ?', [email]
        )
        return rows[0] || null;
    },
    async findByUsername(username) {
        const [rows] = await pool.query(
            'SELECT * FROM Users WHERE username = ?', [username]
        )
        return rows[0] || null;
    },
    async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM Users WHERE id = ?', [id]
        )
        return rows[0] || null;
    },

    async create( { name, username, email, password } ) {
        const hasedPassword = await bcrypt.hash(password, 12);
        const [result] = await pool.query(
            'INSERT INTO Users (name, username, email, password) VALUES (?, ?, ?, ?)',
            [name, username, email, hasedPassword]
        )
        return result.insertId;
    },
    async update( { name, username, email, password, id } ) {
        const hasedPassword = await bcrypt.hash(password, 12);
        const [result] = await pool.query(
            'UPDATE Users SET name = ?, username = ?, email = ?, password = ? WHERE id = ?',
            [name, username, email, password, id]
        )
        return result.affectedRows;
    },
    async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM Users WHERE id = ?',
            [id]
        )
        return null;
    },
    async isPasswordCorrect(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword)
    },

    generateAccessToken(user){
        return jwt.sign(
            {   id: user.id,
                username: user.username,
                email: user.email
            },
            ACCESS_TOKEN_SECRET,
            {
                expiresIn: ACCESS_TOKEN_EXPIRY
            }
        )
    },
    generateRefreshToken(user){
        return (
            { id: user.id },
            REFRESH_TOKEN_SECRET,
            {
                expiresIn: REFRESH_TOKEN_EXPIRY
            }
        )
    }
}

export default UserModel;