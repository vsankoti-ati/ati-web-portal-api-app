import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'infy@123',
    database: process.env.DB_DATABASE || 'ati_web_portal',
    entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    synchronize: false,
    migrationsRun: true,
    logging: process.env.NODE_ENV === 'development',
    options: {
        encrypt: process.env.NODE_ENV === 'production', // Use true for Azure SQL
        trustServerCertificate: process.env.NODE_ENV === 'development', // Only for local development
    },
} as TypeOrmModuleOptions;
