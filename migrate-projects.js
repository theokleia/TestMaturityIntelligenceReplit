// Migration script to add project details fields to database
import pg from 'pg';
const { Pool } = pg;

// Get database connection details from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration to add project details columns...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Add new columns to projects table
    const alterTableQuery = `
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS project_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS industry_area VARCHAR(100),
      ADD COLUMN IF NOT EXISTS regulations TEXT,
      ADD COLUMN IF NOT EXISTS tech_stack TEXT,
      ADD COLUMN IF NOT EXISTS target_audience TEXT,
      ADD COLUMN IF NOT EXISTS business_context TEXT,
      ADD COLUMN IF NOT EXISTS quality_focus TEXT;
    `;
    
    await client.query(alterTableQuery);
    console.log('Successfully added new project detail columns');
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Migration completed successfully');
    
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Release client back to pool
    client.release();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Migration script finished, exiting.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration script failed with error:', err);
    process.exit(1);
  });