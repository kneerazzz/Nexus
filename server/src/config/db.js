import mysql from 'mysql2/promise';
import { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT } from './env.js';

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10 
})

const connectDB = async () => {
    try {
        const connection  = await pool.getConnection();
        console.log("Connected to MySQL database");
        connection.release();
    } catch (error) {
        console.error("Error connecting to MySQL database:", error.message);
        process.exit(1);
    }
}

export { pool, connectDB };