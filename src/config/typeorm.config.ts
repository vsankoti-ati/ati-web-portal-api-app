import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DefaultAzureCredential } from '@azure/identity';

const isProduction = process.env.NODE_ENV === 'production';

// Function to get Azure SQL access token using managed identity
export async function getAzureSqlAccessToken(): Promise<string> {
    const credential = new DefaultAzureCredential();
    const tokenResponse = await credential.getToken('https://database.windows.net/.default');
    return tokenResponse.token;
}

// Base configuration
const baseConfig: Partial<TypeOrmModuleOptions> = {
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE || 'ati_web_portal',
    entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    synchronize: false,
    migrationsRun: true,
    logging: process.env.NODE_ENV === 'development',
};

// Async factory for TypeORM configuration with managed identity support
export const typeOrmConfigFactory = async (): Promise<TypeOrmModuleOptions> => {
    if (isProduction) {
        // Production: Use managed identity
        const token = await getAzureSqlAccessToken();
        return {
            ...baseConfig,
            extra: {
                options: {
                    encrypt: true,
                    trustServerCertificate: false,
                },
                authentication: {
                    type: 'azure-active-directory-default',                
                },
            }
        } as TypeOrmModuleOptions;
    } else {
        // Development: Use username/password
        return {
            ...baseConfig,
            username: process.env.DB_USERNAME || 'sa',
            password: process.env.DB_PASSWORD || 'infy@123',
            options: {
                encrypt: false,
                trustServerCertificate: true,
            },
        } as TypeOrmModuleOptions;
    }
};

// Export synchronous config for development/backwards compatibility
export const typeOrmConfig: TypeOrmModuleOptions = {
    ...baseConfig,
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'infy@123',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
} as TypeOrmModuleOptions;
