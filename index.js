import pool from "./src/db/db.js";

console.log(await pool.query(`SELECT NOW()`));