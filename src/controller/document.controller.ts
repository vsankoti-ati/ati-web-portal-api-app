import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DocumentService } from '../services/document.service';

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentController {
    constructor(private documentService: DocumentService) { }

    @Get()
    async getAllDocuments(@Query('type') type: string, @Query('category') category: string) {
        return this.documentService.getAllDocuments(type, category);
    }

    @Get(':id')
    async getDocument(@Param('id') id: string) {
        return this.documentService.getDocument(id);
    }

    @Post()
    async uploadDocument(@Body() documentData: any, @Request() req) {
        if (req.user.role !== 'Admin' && req.user.role !== 'HR') {
            throw new Error('Only admin/HR can upload documents');
        }
        return this.documentService.uploadDocument({ ...documentData, uploaded_by: req.user.userId });
    }

    @Delete(':id')
    async deleteDocument(@Param('id') id: string, @Request() req) {
        if (req.user.role !== 'Admin') {
            throw new Error('Only admins can delete documents');
        }
        return this.documentService.deleteDocument(id);
    }
}
