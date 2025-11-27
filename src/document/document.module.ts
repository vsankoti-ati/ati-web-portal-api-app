import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../entities/document.entity';
import { DocumentService } from '../services/document.service';
import { DocumentController } from '../controller/document.controller';
import { MockDataModule } from '../services/mock-data.module';

@Module({
    imports: [TypeOrmModule.forFeature([Document]), MockDataModule],
    controllers: [DocumentController],
    providers: [DocumentService],
    exports: [DocumentService],
})
export class DocumentModule { }
