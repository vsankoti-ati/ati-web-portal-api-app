import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateLeavesAndApplicationsTable1700000004000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create leaves table
        await queryRunner.createTable(
            new Table({
                name: 'leaves',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        default: 'NEWID()',
                    },
                    {
                        name: 'employee_id',
                        type: 'uniqueidentifier',
                    },
                    {
                        name: 'leave_type',
                        type: 'nvarchar',
                        length: '50',
                    },
                    {
                        name: 'total_days',
                        type: 'int',
                    },
                    {
                        name: 'used_days',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'remaining_days',
                        type: 'int',
                    },
                    {
                        name: 'year',
                        type: 'int',
                    },
                ],
            }),
            true,
        );

        // Create leave_applications table
        await queryRunner.createTable(
            new Table({
                name: 'leave_applications',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        default: 'NEWID()',
                    },
                    {
                        name: 'employee_id',
                        type: 'uniqueidentifier',
                    },
                    {
                        name: 'leave_type',
                        type: 'nvarchar',
                        length: '50',
                    },
                    {
                        name: 'start_date',
                        type: 'date',
                    },
                    {
                        name: 'end_date',
                        type: 'date',
                    },
                    {
                        name: 'days_requested',
                        type: 'int',
                    },
                    {
                        name: 'reason',
                        type: 'nvarchar',
                        length: 'MAX',
                    },
                    {
                        name: 'status',
                        type: 'nvarchar',
                        length: '20',
                        default: "'Pending'",
                    },
                    {
                        name: 'applied_date',
                        type: 'datetime2',
                        default: 'GETDATE()',
                    },
                    {
                        name: 'approved_by',
                        type: 'uniqueidentifier',
                        isNullable: true,
                    },
                    {
                        name: 'approved_date',
                        type: 'datetime2',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            'leaves',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'employees',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'leave_applications',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'employees',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('leave_applications');
        await queryRunner.dropTable('leaves');
    }
}
