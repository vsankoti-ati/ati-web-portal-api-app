import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MockDataService implements OnModuleInit {
    private data: Record<string, any[]> = {};
    private readonly mockDataPath = path.join(__dirname, '../../mock-data');

    async onModuleInit() {
        if (process.env.USE_MOCK_DATA === 'true') {
            await this.loadAllMockData();
        }
    }

    private async loadAllMockData() {
        const files = [
            'users.json',
            'announcements.json',
            'employees.json',
            'leave-balances.json',
            'leave-applications.json',
            'job-openings.json',
            'candidates.json',
            'job-referrals.json',
            'holidays.json',
            'projects.json',
            'timesheets.json',
            'time-entries.json',
            'documents.json',
        ];
        for (const file of files) {
            const entityName = file.replace('.json', '');
            this.data[entityName] = await this.loadMockData(file);
        }
        console.log('Mock data loaded:', Object.keys(this.data));
    }

    private async loadMockData(filename: string): Promise<any[]> {
        const filePath = path.join(this.mockDataPath, filename);
        if (fs.existsSync(filePath)) {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        }
        return [];
    }

    getMockData(entity: string): any[] {
        return this.data[entity] || [];
    }

    async saveMockData(entity: string, data: any[]) {
        this.data[entity] = data;
    }
}
