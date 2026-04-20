import { pool } from "../config/db.js";

const TagModel = {
    async findAll(){
        const [rows] = await pool.query(
            `SELECT t.*,
                COUNT(DISTINCT dt.document_id) AS document_count,
                COUNT(DISTINCT it.image_id) AS image_count
            FROM Tags t
            LEFT JOIN DocumentTags dt ON t.id = dt.tag_id
            LEFT JOIN ImageTags it ON t.id = it.tag_id
            GROUP BY t.id
            ORDER BY t.name ASC`
        )
        return rows;
    },
    async findById(id){
        const [rows] = await pool.query(
            `SELECT t.*,
                COUNT(DISTINCT dt.document_id) AS document_count,
                COUNT(DISTINCT it.image_id) AS image_count
            FROM Tags t
            LEFT JOIN DocumentTags dt ON t.id = dt.tag_id
            LEFT JOIN ImageTags it ON t.id = it.tag_id
            WHERE t.id = ?
            GROUP BY t.id`,
            [id]
        )
        return rows[0] || null;
    },

    async findByName(name){
        const [rows] = await pool.query(
            `SELECT * FROM Tags WHERE name = ?`, [name]
        );
        return rows[0] || null;
    },

    async create({name, color}){
        const [result] = await pool.query(
            `INSERT INTO Tags (name, color) VALUES (?, ?)`, [name, color || '#977e7c']
        )
        return result.insertId;
    },
    async update({name, color, id}){
        const [result] = await pool.query(
            `UPDATE Tags SET name = ?, color = ? WHERE id = ?`,
            [name, color, id]
        )
        return result.affectedRows;
    },

    async delete(id){
        const [result] = await pool.query(
            `DELETE FROM Tags WHERE id = ?`,
            [id]
        )
        return result.affectedRows;
    },

    // ---assign tags to document

    async addToDocument({document_id, tag_id}){
        await pool.query(
            `INSERT IGNORE INTO DocumentTags (document_id, tag_id) VALUES (?, ?)`,
            [document_id, tag_id]
        )
    },

    async removeFromDocument({document_id, tag_id}){
        const [result] = await pool.query(
            `DELETE FROM DocumentTags WHERE document_id = ? AND tag_id = ?`,
            [document_id, tag_id]
        )
        return result.affectedRows;
    },

    //---assign tags to image

    async addToImage({image_id, tag_id}){
        await pool.query(
            `INSERT IGNORE INTO ImageTags (image_id, tag_id) VALUES (?, ?)`,
            [image_id, tag_id]
        )
    },

    async removeFromImage({image_id, tag_id}){
        const [result] = await pool.query(
            `DELETE FROM ImageTags WHERE image_id = ? AND tag_id = ?`,
            [image_id, tag_id]
        )
        return result.affectedRows;
    }
}

export default TagModel