import { pool } from "../config/db.js";

const RelationModel = {
    async findAll({source_type, source_id}){
        const [rows] = await pool.query(
            `SELECT * FROM Relations
             WHERE source_type = ? AND source_id = ?
             ORDER BY created_at DESC`,
             [source_type, source_id]
        );
        return rows;
    },
    async findById(id){
        const [rows] = await pool.query(
            `SELECT * FROM Relations
            WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    },
    async create({source_type, source_id, target_type, target_id, relation_label}){
        const [result] = await pool.query(
            `INSERT INTO Relations (source_type, source_id, target_type, target_id, relation_label)
            VALUES (?, ?, ?, ?, ?)`,
            [source_type, source_id, target_type, target_id, relation_label || null]
        );
        return result.insertId;
    },
    async delete(id){
        const [result] = await pool.query(
            `DELETE FROM Relations WHERE id = ?`,
            [id]
        );
        return result.affectedRows;
    },

    //find all the relations where this entity is source or target

    async findAllForEntity({ type, id }){
        const [rows] = await pool.query(
            `SELECT * FROM Relations
            WHERE (source_type = ? AND source_id = ?)
            OR (target_type = ? AND target_id = ?)
            ORDER BY created_at DESC`,
            [type, id, type, id]
        );
        return rows;
    },
    async findDuplicate({ source_type, source_id, target_type, target_id }) {
        const [rows] = await pool.query(
            `SELECT * FROM Relations
            WHERE source_type = ? AND source_id = ?
            AND target_type = ? AND target_id = ?`,
            [source_type, source_id, target_type, target_id]
        )
        return rows[0] || null;
    }
}

export default RelationModel;