import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHolidaysAnnouncementsDocumentsTable1700000007000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create holidays table
        await queryRunner.createTable(
            new Table({
                name: 'holidays',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        default: 'NEWID()',
                    },
                    {
                        name: 'year',
                        type: 'int',
                    },
                    {
                        name: 'client',
                        type: 'nvarchar',
                        length: '100',
                    },
                    {
                        name: 'date',
                        type: 'date',
                    },
                    {
                        name: 'occasion',
                        type: 'nvarchar',
                        length: '255',
                    },
                    {
                        name: 'created_at',
                        type: 'datetime2',
                        default: 'GETDATE()',
                    },
                ],
            }),
            true,
        );

        // Create announcements table
        await queryRunner.createTable(
            new Table({
                name: 'announcements',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        default: 'NEWID()',
                    },
                    {
                        name: 'title',
                        type: 'nvarchar',
                        length: '255',
                    },
                    {
                        name: 'content',
                        type: 'nvarchar',
                        length: 'MAX',
                    },
                    {
                        name: 'category',
                        type: 'nvarchar',
                        length: '100',
                    },
                    {
                        name: 'priority',
                        type: 'nvarchar',
                        length: '50',
                    },
                    {
                        name: 'created_at',
                        type: 'datetime2',
                        default: 'GETDATE()',
                    },
                ],
            }),
            true,
        );

        // Create documents table
        await queryRunner.createTable(
            new Table({
                name: 'documents',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        default: 'NEWID()',
                    },
                    {
                        name: 'name',
                        type: 'nvarchar',
                        length: '255',
                    },
                    {
                        name: 'type',
                        type: 'nvarchar',
                        length: '50',
                    },
                    {
                        name: 'category',
                        type: 'nvarchar',
                        length: '100',
                    },
                    {
                        name: 'description',
                        type: 'nvarchar',
                        length: 'MAX',
                        isNullable: true,
                    },
                    {
                        name: 'file_size',
                        type: 'int',
                    },
                    {
                        name: 'file_url',
                        type: 'nvarchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'datetime2',
                        default: 'GETDATE()',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('documents');
        await queryRunner.dropTable('announcements');
        await queryRunner.dropTable('holidays');
    }
}
