import { pool } from '../config/db.js';

const ActivityService = {
    async log({ user_id, action, entity_type, entity_id, metadata }) {
        await pool.query(
            `INSERT INTO ActivityLogs 
                (user_id, action, entity_type, entity_id, metadata)
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, action, entity_type || null, entity_id || null, 
             metadata ? JSON.stringify(metadata) : null]
        );
    }
};

export default ActivityService;