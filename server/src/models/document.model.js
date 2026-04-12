import { pool } from "../config/db.js"

const DocumentModel = {
    async findAll(user_id) {
        const [rows] = await pool.query(
            `SELECT d.*,
                GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ', ') AS tags,
                COALESCE(latest.file_url, d.file_url) AS current_file_url,
                COALESCE(latest.version_num, 0) AS current_version
            FROM Documents d
            LEFT JOIN DocumentTags dt ON d.id = dt.document_id
            LEFT JOIN Tags t ON dt.tag_id = t.id
            LEFT JOIN (
                SELECT document_id, file_url, version_num
                FROM DocumentVersions
                WHERE (document_id, version_num) IN (
                    SELECT document_id, MAX(version_num)
                    FROM DocumentVersions
                    GROUP BY document_id
                )
            ) latest ON d.id = latest.document_id
            WHERE d.user_id = ?
            GROUP BY d.id
            ORDER BY d.created_at DESC`,
            [user_id]
        );
        return rows;
    },
    async findById(id, user_id) {
        const [rows] = await pool.query(
            `SELECT d.*,
                GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ', ') AS tags,
                COALESCE(latest.file_url, d.file_url) AS current_file_url,
                COALESCE(latest.version_num, 0) AS current_version
            FROM Documents d
            LEFT JOIN DocumentTags dt ON d.id = dt.document_id
            LEFT JOIN Tags t ON dt.tag_id = t.id
            LEFT JOIN (
                SELECT document_id, file_url, version_num
                FROM DocumentVersions
                WHERE (document_id, version_num) IN (
                    SELECT document_id, MAX(version_num)
                    FROM DocumentVersions
                    GROUP BY document_id
                )
            ) latest ON d.id = latest.document_id
            WHERE d.id = ? AND d.user_id = ?
            GROUP BY d.id`,
            [id, user_id]
        );
        return rows[0] || null;
    },

    async create({user_id, title, description, file_url, public_id, file_type, file_size, content}){
        const [result] = await pool.query(
            'INSERT INTO Documents (user_id, title, description, file_url, public_id, file_type, file_size, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, title, description, file_url, public_id, file_type, file_size, content]
        )
        return result.insertId;
    },

    async update({title, description, id, user_id}){
        const [result] = await pool.query(
            'UPDATE Documents SET title = ?, description = ? WHERE id = ? AND user_id = ?',
            [title, description, id, user_id]
        )
        return result.affectedRows;
    },

    async delete({id, user_id}){
        const [result] = await pool.query(
            'DELETE FROM Documents WHERE id = ? AND user_id = ?',
            [id, user_id]
        )
        return result.affectedRows;
    },

    async search({query, user_id}){
        const [rows] = await pool.query(
            `SELECT id, title, description, file_type, file_size, created_at,
                MATCH( title, content ) AGAINST(? IN NATURAL LANGUAGE MODE) AS score
            FROM Documents
            WHERE user_id = ?
            AND MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE)
            ORDER BY score DESC
            LIMIT 20`,
            [query, user_id, query]
        );
        return rows;
    },

    async getVersions(documentId){
        const [rows] = await pool.query(
            `SELECT * FROM DocumentVersions
            WHERE document_id = ?
            ORDER BY version_num DESC`,
            [documentId]
        )
        return rows;
    },

    async getLatestVersionNum(documentId){
        const [rows] = await pool.query(
            `SELECT MAX(version_num) AS latest FROM DocumentVersions
            WHERE document_id = ?`,
            [documentId]
        )
        return rows[0].latest || 0;
    },

    async createVersion({document_id, version_num, file_url, public_id, file_size, change_note}){
        const [result] = await pool.query(
            `INSERT INTO DocumentVersions (document_id, version_num, file_url, public_id, file_size, change_note) VALUES (?, ?, ?, ?, ?, ?)`,
            [document_id, version_num, file_url, public_id, file_size, change_note]
        )
        return result.insertId;
    }
}

export default DocumentModel;

