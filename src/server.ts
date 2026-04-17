import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { connectRedis, redisClient } from './redisClient';
import { runETLPipeline } from './etl/pipeline';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Root Endpoint: Health Check
app.get('/', (req, res) => {
    res.json({ 
        status: "Active", 
        service: "Horizon ETL Microservice",
        message: "Navigate to /api/projections/:playerId to fetch cached data."
    });
});

// Main Endpoint: Fetch Player Projection
app.get('/api/projections/:playerId', async (req, res) => {
    const { playerId } = req.params;

    try {
        // Query the Redis Cache directly (Sub-millisecond retrieval)
        const cachedData = await redisClient.get(`projection:${playerId}`);
        
        if (cachedData) {
            return res.json({
                source: "Redis Cache",
                data: JSON.parse(cachedData)
            });
        } else {
            return res.status(404).json({ error: "Player projection not found in cache. ETL may be required." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error connecting to cache." });
    }
});

// Initialize Server and Database
async function startServer() {
    await connectRedis();

    // Run the ETL pipeline immediately on startup so we have data to test
    await runETLPipeline();

    // Schedule the ETL to run every night at midnight
    cron.schedule('0 0 * * *', () => {
        runETLPipeline();
    });

    app.listen(PORT, () => {
        console.log(`🚀 Horizon ETL Microservice running on http://localhost:${PORT}`);
    });
}

startServer();
