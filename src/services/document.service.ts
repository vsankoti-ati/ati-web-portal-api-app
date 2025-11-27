import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { MockDataService } from './mock-data.service';

@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(Document)
        private documentRepository: Repository<Document>,
        private mockDataService: MockDataService,
    ) { }

    async getAllDocuments(type?: string, category?: string): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            let documents = this.mockDataService.getMockData('documents').filter((d) => d.is_active);
            if (type) {
                documents = documents.filter((d) => d.type === type);
            }
            if (category) {
                documents = documents.filter((d) => d.category === category);
            }
            return documents;
        }
        const where: any = { is_active: true };
        if (type) where.type = type;
        if (category) where.category = category;
        return this.documentRepository.find({ where });
    }

    async getDocument(id: string): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const documents = this.mockDataService.getMockData('documents');
            return documents.find((d) => d.id === id);
        }
        return this.documentRepository.findOne({ where: { id } });
    }

    async uploadDocument(documentData: any): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const documents = this.mockDataService.getMockData('documents');
            const newDoc = {
                id: `doc-${Date.now()}`,
                ...documentData,
                is_active: true,
                created_at: new Date().toISOString(),
            };
            documents.push(newDoc);
            await this.mockDataService.saveMockData('documents', documents);
            return newDoc;
        }
        const document = this.documentRepository.create(documentData);
        return this.documentRepository.save(document);
    }

    async deleteDocument(id: string): Promise<void> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const documents = this.mockDataService.getMockData('documents');
            const doc = documents.find((d) => d.id === id);
            if (doc) {
                doc.is_active = false;
                await this.mockDataService.saveMockData('documents', documents);
            }
            return;
        }
        await this.documentRepository.update(id, { is_active: false });
    }
}
