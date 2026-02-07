import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCreatedAtToTimesheetsAndEntries1770465252530 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add created_at to timesheets table
        await queryRunner.addColumn(
            'timesheets',
            new TableColumn({
                name: 'created_at',
                type: 'datetime2',
                default: 'GETDATE()',
            }),
        );

        // Add created_at to time_entries table
        await queryRunner.addColumn(
            'time_entries',
            new TableColumn({
                name: 'created_at',
                type: 'datetime2',
                default: 'GETDATE()',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('time_entries', 'created_at');
        await queryRunner.dropColumn('timesheets', 'created_at');
    }
}
