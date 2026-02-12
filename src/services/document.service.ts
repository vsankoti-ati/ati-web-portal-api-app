import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';

@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(Document)
        private documentRepository: Repository<Document>,
    ) { }

    async getAllDocuments(type?: string, category?: string): Promise<any[]> {
        const where: any = { is_active: true };
        if (type) where.type = type;
        if (category) where.category = category;
        return this.documentRepository.find({ where });
    }

    async getDocument(id: string): Promise<any> {
        return this.documentRepository.findOne({ where: { id } });
    }

    async uploadDocument(documentData: any): Promise<any> {
        const document = this.documentRepository.create(documentData);
        return this.documentRepository.save(document);
    }

    async deleteDocument(id: string): Promise<void> {
        await this.documentRepository.update(id, { is_active: false });
    }
}
