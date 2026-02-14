import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JWT_SECRET } from './config/jwt.config';

async function bootstrap() {
    try {
        console.log('Starting application...');
        console.log('JWT_SECRET loaded:', JWT_SECRET);
        
        const app = await NestFactory.create(AppModule);
        
        // Log all incoming requests
        app.use((req, res, next) => {
            console.log('\n========================================');
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);            
            console.log('========================================');
            next();
        });
        
        app.enableCors({
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });
        console.log('Application created successfully, starting server on port 3001...');
        await app.listen(3001);
        console.log('Application is running on http://localhost:3001');
    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}
bootstrap();
