import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateJobsTable1700000005000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create job_openings table
        await queryRunner.createTable(
            new Table({
                name: 'job_openings',
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
                        name: 'role',
                        type: 'nvarchar',
                        length: '100',
                    },
                    {
                        name: 'job_description',
                        type: 'nvarchar',
                        length: 'MAX',
                    },
                    {
                        name: 'requirement',
                        type: 'nvarchar',
                        length: 'MAX',
                    },
                    {
                        name: 'created_by',
                        type: 'uniqueidentifier',
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

        // Create job_referrals table
        await queryRunner.createTable(
            new Table({
                name: 'job_referrals',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        default: 'NEWID()',
                    },
                    {
                        name: 'job_opening_id',
                        type: 'uniqueidentifier',
                    },
                    {
                        name: 'referred_by',
                        type: 'uniqueidentifier',
                    },
                    {
                        name: 'candidate_name',
                        type: 'nvarchar',
                        length: '255',
                    },
                    {
                        name: 'candidate_email',
                        type: 'nvarchar',
                        length: '255',
                    },
                    {
                        name: 'candidate_phone',
                        type: 'nvarchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'resume_link',
                        type: 'nvarchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'nvarchar',
                        length: '50',
                        default: "'Pending'",
                    },
                    {
                        name: 'referred_date',
                        type: 'datetime2',
                        default: 'GETDATE()',
                    },
                ],
            }),
            true,
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            'job_referrals',
            new TableForeignKey({
                columnNames: ['job_opening_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'job_openings',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'job_referrals',
            new TableForeignKey({
                columnNames: ['referred_by'],
                referencedColumnNames: ['id'],
                referencedTableName: 'employees',
                onDelete: 'NO ACTION',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('job_referrals');
        await queryRunner.dropTable('job_openings');
    }
}
