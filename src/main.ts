import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    try {
        console.log('Starting application...');
        const app = await NestFactory.create(AppModule);
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
