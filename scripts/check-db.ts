/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * 
 * This source code is licensed under the Business Source License 1.1.
 * You may not use this file except in compliance with the License.
 * 
 * For full license text, see the LICENSE-BSL file in the repository root.
 */

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
