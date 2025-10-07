import 'dotenv/config';
import mysql from 'mysql2';

const connection=mysql.createConnection({
    host:process.env.DB_HOST,//'127.0.0.1',//localhost
    user:process.env.DB_USER,//'root', 
    password:process.env.DB_PASSWORD,//'123456789',
    database:process.env.DB_DATABASE//'course_advising'
})


export { connection };