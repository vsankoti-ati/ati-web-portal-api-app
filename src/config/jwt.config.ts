import { config } from 'dotenv';

// Load .env FIRST before anything else
config();

// Export the JWT secret as a constant to ensure it's the same everywhere
export const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

console.log('📋 [Config] JWT_SECRET loaded:', JWT_SECRET);
