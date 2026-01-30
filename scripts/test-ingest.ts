
import { ingestAllFeeds } from '../lib/ingestor';

async function test() {
    console.log("Running ingestion test...");
    try {
        const report = await ingestAllFeeds();
        console.log("Ingestion Report:", JSON.stringify(report, null, 2));
    } catch (e) {
        console.error("Ingestion failed:", e);
    }
}

test();
