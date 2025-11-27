const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'infy@123',
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE || 'ati_web_portal',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function testConnection() {
    try {
        console.log('Testing connection with config:', {
            ...config,
            password: '****'
        });
        await sql.connect(config);
        console.log('✅ Connection successful!');

        const result = await sql.query`SELECT name FROM sys.tables`;
        console.log('Tables in database:', result.recordset.map(r => r.name));

        await sql.close();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.code === 'ESOCKET') {
            console.error('Hint: Check if SQL Server is running and TCP/IP is enabled.');
        } else if (err.code === 'ELOGIN') {
            console.error('Hint: Check your username and password.');
        }
    }
}

testConnection();
