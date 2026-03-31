import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
});

export const {
    PORT,
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME
} = process.env;