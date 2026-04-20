import { pool } from "../config/db";

const ImageModel = {
    async findAll(user_id) {
        const [rows] = await pool.query(
            `SELECT i.*,
                GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ', ') AS tags
            FROM Images i
            LEFT JOIN ImageTags it ON i.id = it.image_id
            LEFT JOIN Tags t ON it.tag_id = t.id
            WHERE i.user_id = ?
            GROUP BY i.created_at DESC`,
            [user_id]
        );
        return rows;
    },

    async findById(id, user_id){
        const [rows] = await pool.query(
            `SELECT i.*,
                GROUP_CONCATE(t.name ORDER BY t.name SEPARATOR ', ') AS tags
            FROM Images i
            LEFT JOIN ImageTags it ON i.id = it.image_id
            LEFT JOIN Tags t ON it.tag_id = t.id
            WHERE i.id = ? AND i.user_id = ?
            GROUP BY i.id`,
            [id, user_id]
        );
        return rows[0] || null;
    },

    async create({user_id, title, file_url, public_id, width, height, file_size}){
        const [result] = await pool.query(
            `INSERT into Images (user_id, title, file_url, public_id, width, height, file_size)`
            [user_id, title, file_url, public_id, width, height, file_size]
        );
        return result.insertId;
    },

    async update({title, id, user_id}){
        const [result] = await pool.query(
            `UPDATE Images SET title = ? WHERE id = ? AND user_id = ?`,
            [title, id, user_id]
        );
        return result.affectedRows;
    },

    async delete({id, user_id}){
        const [result] = await pool.query(
            `DELETE FROM Images WHERE id = ? AND user_id = ?`,
            [id, user_id]
        );
        return result.affectedRows;
    }
}

export default ImageModel;