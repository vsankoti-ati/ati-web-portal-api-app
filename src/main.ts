import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JWT_SECRET } from './config/jwt.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    try {
        console.log('Starting application...');
        
        const app = await NestFactory.create(AppModule);
        
        // Log all incoming requests
        app.use((req, res, next) => {            
            next();
        });
        
        app.enableCors({
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });

        // Swagger Configuration
        const config = new DocumentBuilder()
            .setTitle('ATI Web Portal API')
            .setDescription('API documentation for ATI Web Portal')
            .setVersion('1.0')
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'JWT',
                    description: 'Enter JWT token',
                    in: 'header',
                },
                'JWT-auth',
            )
            .build();
        
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api', app, document);
        
        console.log('Application created successfully, starting server on port 3001...');
        await app.listen(3001);
        console.log('Application is running on http://localhost:3001');
        console.log('Swagger documentation is available at http://localhost:3001/api');
    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}
bootstrap();
