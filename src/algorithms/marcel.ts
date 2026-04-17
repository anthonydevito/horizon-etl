export interface PlayerSeason {
    year: number;
    wOBA: number;
    plateAppearances: number;
}

export interface PlayerData {
    playerId: string;
    name: string;
    age: number; // Age for the upcoming projected season
    history: PlayerSeason[]; // Array of the last 3 seasons
}

/**
 * A simplified "Marcel" projection for wOBA.
 * Weights: Year 1 (Most recent) = 5, Year 2 = 4, Year 3 = 3
 * Regresses to league average and applies a basic aging curve.
 */
export function calculateProjection(player: PlayerData): number {
    const LEAGUE_AVG_WOBA = 0.320;
    
    // Sort history to ensure descending order (most recent first)
    const sortedHistory = [...player.history].sort((a, b) => b.year - a.year);
    
    let weightedWoBA = 0;
    let totalWeight = 0;
    let totalPA = 0;

    // Apply the 5/4/3 Marcel weighting
    const weights = [5, 4, 3];
    
    sortedHistory.forEach((season, index) => {
        if (index < 3) { // Only use up to the last 3 years
            const weight = weights[index];
            // Weighting factors in both the recency (5/4/3) and the sample size (Plate Appearances)
            weightedWoBA += season.wOBA * weight * season.plateAppearances;
            totalWeight += weight * season.plateAppearances;
            totalPA += season.plateAppearances;
        }
    });

    // If there's no history, project league average
    if (totalWeight === 0) return LEAGUE_AVG_WOBA;

    let baselineProjection = weightedWoBA / totalWeight;

    // Regression to the mean (add 1200 PA of league average to stabilize the data)
    const REGRESSION_PA = 1200;
    baselineProjection = ((baselineProjection * totalPA) + (LEAGUE_AVG_WOBA * REGRESSION_PA)) / (totalPA + REGRESSION_PA);

    // Basic Aging Curve: Peak is 28.
    // +0.003 to wOBA for every year under 28. -0.003 for every year over 28.
    let ageAdjustment = 0;
    if (player.age < 28) {
        ageAdjustment = (28 - player.age) * 0.003;
    } else if (player.age > 28) {
        ageAdjustment = (28 - player.age) * 0.003; // Will be negative
    }

    const finalProjection = baselineProjection + ageAdjustment;

    // Return rounded to 3 decimal places
    return Math.round(finalProjection * 1000) / 1000;
}
