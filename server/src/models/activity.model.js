import { pool } from "../config/db.js";

const ActivityModel = {
    async findByUser(user_id){
        const [rows] = await pool.query(
            `SELECT * FROM ActivityLogs WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50`,
            [user_id]
        )
        return rows;
    }
}

export default ActivityModel;