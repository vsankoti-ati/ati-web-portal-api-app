import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmployeeAdminNotes1771475343471 implements MigrationInterface {
    name = 'AddEmployeeAdminNotes1771475343471'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD "admin_notes" nvarchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "admin_notes"`);
    }

}
