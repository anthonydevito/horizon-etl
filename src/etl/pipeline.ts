import { redisClient } from '../redisClient';
import { calculateProjection, PlayerData } from '../algorithms/marcel';

// Simulated external data source (e.g., pulling from a MiLB or NPB database)
const mockDatabase: PlayerData[] = [
    {
        playerId: "jrod_001",
        name: "Julio Rodriguez",
        age: 25, // Under 28, aging curve will boost him
        history: [
            { year: 2025, wOBA: 0.355, plateAppearances: 650 },
            { year: 2024, wOBA: 0.340, plateAppearances: 600 },
            { year: 2023, wOBA: 0.330, plateAppearances: 550 },
        ]
    },
    {
        playerId: "goldy_002",
        name: "Paul Goldschmidt",
        age: 38, // Well over 28, aging curve will regress him
        history: [
            { year: 2025, wOBA: 0.315, plateAppearances: 500 },
            { year: 2024, wOBA: 0.322, plateAppearances: 620 },
            { year: 2023, wOBA: 0.340, plateAppearances: 650 },
        ]
    }
];

export async function runETLPipeline() {
    console.log('⏳ Starting Nightly ETL Pipeline...');
    let processedCount = 0;

    try {
        for (const player of mockDatabase) {
            // 1. Transform: Run the projection algorithm
            const projectedWoBA = calculateProjection(player);

            // 2. Format the payload for the cache
            const cachePayload = {
                name: player.name,
                ageNextSeason: player.age,
                projectedWoBA: projectedWoBA,
                lastUpdated: new Date().toISOString()
            };

            // 3. Load: Save to Redis Cache (Key = playerId, Value = JSON String)
            await redisClient.set(`projection:${player.playerId}`, JSON.stringify(cachePayload));
            processedCount++;
        }
        console.log(`✅ ETL Complete: ${processedCount} players projected and cached.`);
    } catch (error) {
        console.error('❌ ETL Pipeline Failed:', error);
    }
}
