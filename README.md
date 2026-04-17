# Horizon ETL: Player Projection Microservice

Horizon ETL is a high-performance, TypeScript-based microservice designed to simulate the backend architecture of a "Bloomberg Terminal for Baseball." It automates the ingestion of player statistics, processes them through a weighted projection algorithm, and caches the results for sub-millisecond retrieval.

## ⚾ The Product Vision
To project players into the future, a front office must ingest massive amounts of data and serve it to scouts instantly. Relying on heavy, on-the-fly SQL queries for complex aging curves and regressions slows down the user experience. Horizon ETL solves this by running projections asynchronously via a cron job and serving the data strictly from an in-memory cache.

## 🏗️ Architecture & Tech Stack
* **Runtime:** Node.js
* **Language:** TypeScript
* **API Framework:** Express.js
* **Caching Layer:** Redis
* **Task Scheduling:** `node-cron`

## 🧮 Data Science & Engineering Decisions
1. **The Marcel Algorithm:** Implemented a TypeScript version of the "Marcel" projection system. The algorithm weights the last 3 years of plate appearances (5/4/3), applies regression to the league average, and calculates an aging curve modifier based on the player's upcoming season.
2. **In-Memory Caching (Redis):** Instead of calculating projections dynamically on every API call, the ETL pipeline writes the finalized projections directly to Redis. This ensures the frontend dashboard receives `O(1)` read speeds.
3. **Automated Batch Processing:** Utilized `node-cron` to schedule the ETL pipeline to run asynchronously at midnight, ensuring scouts wake up to fresh projections daily without bogging down daytime server resources.

## 🛠️ How to Run Locally

**1. Start the Redis Cache (Via Docker)**
```bash
docker run -d -p 6379:6379 --name horizon-redis redis
```

**2. Install Dependencies & Run the Server**
```bash
npm install
npm run dev
```

**3. Test the API (Browser of cURL)**
Navigate to: http://localhost:3000/api/projections/jrod_001

### The Final Execution Steps

1. Save all your files.
2. In your terminal, start up your Redis database using Docker:
```bash
docker run -d -p 6379:6379 --name horizon-redis redis
```
3. Start your microservice:
```bash
npm run dev
```
4. Open your browser and go to http://localhost:3000/api/projections/jrod_001. You will see Julio Rodriguez's dynamically calculated, age-adjusted projection pulled instantly from the Redis cache!
