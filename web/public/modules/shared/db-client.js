/**
 * Browser Database Client
 * Provides PGlite database integration for client-side formula compilation
 */

let pgliteInstance = null;

/**
 * Initialize PGlite database with seed data
 */
export async function initializeBrowserDatabase() {
    if (pgliteInstance) {
        return pgliteInstance;
    }

    try {
        // Import PGlite from CDN
        const { PGlite } = await import('https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.1.5/dist/index.js');
        
        // Create PGlite instance
        pgliteInstance = new PGlite();
        console.log('🔌 PGlite database initialized');

        // Load seed data
        const seedSQL = await fetch('./modules/shared/seed.sql').then(r => r.text());
        await pgliteInstance.exec(seedSQL);
        console.log('🌱 Database seeded with real estate CRM data');

        // Wrap with consistent interface
        return {
            query: async (sql, params = []) => {
                const result = await pgliteInstance.query(sql, params);
                return { rows: result.rows };
            },
            exec: (sql) => pgliteInstance.exec(sql),
            close: () => {
                // PGlite doesn't need explicit closing
                console.log('🔒 Database connection closed');
            },
            connect: () => {
                // Already connected
                console.log('✅ Database already connected');
            }
        };

    } catch (error) {
        console.error('❌ Failed to initialize PGlite:', error);
        throw new Error(`Database initialization failed: ${error.message}`);
    }
}