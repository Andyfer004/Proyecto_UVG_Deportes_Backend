import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'Admin',
  database: 'deportes',
  password: 'Admin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;