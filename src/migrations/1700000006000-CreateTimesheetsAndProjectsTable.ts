import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTimesheetsAndProjectsTable1700000006000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create projects table
        await queryRunner.createTable(
            new Table({
                name: 'projects',
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
                        name: 'description',
                        type: 'nvarchar',
                        length: 'MAX',
                        isNullable: true,
                    },
                    {
                        name: 'start_date',
                        type: 'date',
                    },
                    {
                        name: 'end_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'nvarchar',
                        length: '50',
                        default: "'Active'",
                    },
                    {
                        name: 'created_at',
                        type: 'datetime2',
                        default: 'GETDATE()',
                    },
                    {
                        name: 'updated_at',
                        type: 'datetime2',
                        default: 'GETDATE()',
                    },
                ],
            }),
            true,
        );

        // Create timesheets table
        await queryRunner.createTable(
            new Table({
                name: 'timesheets',
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
                        name: 'week_start_date',
                        type: 'date',
                    },
                    {
                        name: 'week_end_date',
                        type: 'date',
                    },
                    {
                        name: 'status',
                        type: 'nvarchar',
                        length: '20',
                        default: "'draft'",
                    },
                    {
                        name: 'submission_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'approval_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'approved_by_employee_id',
                        type: 'uniqueidentifier',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // Create time_entries table
        await queryRunner.createTable(
            new Table({
                name: 'time_entries',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        default: 'NEWID()',
                    },
                    {
                        name: 'timesheet_id',
                        type: 'uniqueidentifier',
                    },
                    {
                        name: 'project_id',
                        type: 'uniqueidentifier',
                    },
                    {
                        name: 'date',
                        type: 'date',
                    },
                    {
                        name: 'hours',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                    },
                    {
                        name: 'description',
                        type: 'nvarchar',
                        length: 'MAX',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            'timesheets',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'employees',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'time_entries',
            new TableForeignKey({
                columnNames: ['timesheet_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'timesheets',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'time_entries',
            new TableForeignKey({
                columnNames: ['project_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'projects',
                onDelete: 'NO ACTION',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('time_entries');
        await queryRunner.dropTable('timesheets');
        await queryRunner.dropTable('projects');
    }
}
