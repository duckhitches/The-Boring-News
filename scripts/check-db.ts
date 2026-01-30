import 'dotenv/config';
import { sql } from '../lib/db';

async function checkConnection() {
    console.log("Checking database connection...");
    try {
        const result = await sql`SELECT version()`;
        console.log("✅ Successfully connected to Neon!");
        console.log("Database version:", result.rows[0].version);
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to connect to database:", error);
        process.exit(1);
    }
}

checkConnection();
