import { createClient } from 'redis';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Initialize the Redis client
export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Log any connection errors
redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// Create a connection function to be called when the server starts
export async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('🟢 Connected to Redis In-Memory Cache');
    }
}
