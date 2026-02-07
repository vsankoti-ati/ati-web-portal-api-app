import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDateToEntryDateInTimeEntries1770465252532 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('time_entries', 'date', 'entry_date');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('time_entries', 'entry_date', 'date');
    }
}
