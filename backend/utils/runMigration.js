/**
 * Database Migration Runner
 * Executes sensor table creation and setup
 * Usage: node backend/utils/runMigration.js
 */

import mysql from 'mysql2/promise.js';
import dotenv from 'dotenv';
import sensorTables from '../migrations/001_create_sensor_tables.js';

dotenv.config();

const config = {
  host: process.env.DB_HOST || '127.0.0.1',  // Use IPv4 instead of localhost
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pelbiot',
  port: process.env.DB_PORT || 3306
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL database...');
    console.log(`   Host: ${config.host}`);
    console.log(`   Database: ${config.database}`);
    
    // First, connect without specifying database to create it if needed
    const connConfig = { ...config };
    delete connConfig.database;
    
    console.log('   Checking/creating database...');
    const tempConnection = await mysql.createConnection(connConfig);
    
    try {
      await tempConnection.execute(
        `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`✅ Database ready: ${config.database}`);
    } catch (dbError) {
      console.log(`ℹ️  Database already exists: ${config.database}`);
    }
    
    await tempConnection.end();
    
    // Now connect to the specific database
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    console.log('📋 Executing sensor table migrations...\n');
    
    // Split the SQL into individual statements
    const statements = sensorTables
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let createdCount = 0;
    
    for (const statement of statements) {
      try {
        await connection.execute(statement);
        
        // Extract table name for logging
        const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
        if (tableMatch) {
          console.log(`✅ Created/verified table: ${tableMatch[1]}`);
          createdCount++;
        }
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
          if (tableMatch) {
            console.log(`ℹ️  Table already exists: ${tableMatch[1]}`);
          }
        } else {
          throw error;
        }
      }
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Tables created/verified: ${createdCount}`);
    console.log(`   - Database: ${config.database}`);
    console.log(`   - Status: All sensor tables ready\n`);

    // Verify tables were created
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [config.database]
    );
    
    const sensorTables = tables
      .map(t => t.TABLE_NAME)
      .filter(name => name.includes('sensor') || name.includes('device'));
    
    console.log(`📈 Sensor-related tables in database:`);
    sensorTables.forEach(table => {
      console.log(`   - ${table}`);
    });

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(`   Error: ${error.message}\n`);
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('💡 Troubleshooting: Make sure MySQL is running');
      console.error('   Windows: net start MySQL80');
      console.error('   Or: Start MySQL from Services');
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Troubleshooting: Check database credentials');
      console.error('   Update backend/.env file');
    }
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Troubleshooting: Create database first');
      console.error(`   mysql -u ${config.user} -p -e "CREATE DATABASE ${config.database};"`);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
runMigration();
