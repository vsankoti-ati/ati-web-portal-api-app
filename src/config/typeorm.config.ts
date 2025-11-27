import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'infy@123',
    database: process.env.DB_DATABASE || 'ati_web_portal',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,    
    //migrationsRun: true,
    logging: process.env.NODE_ENV === 'development',
    options: {
        encrypt: false, // Use true for Azure SQL
        trustServerCertificate: true, // For local SQL Server
    },
};
