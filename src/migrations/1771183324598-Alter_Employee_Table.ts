import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterEmployeeTable1771183324598 implements MigrationInterface {
    name = 'AlterEmployeeTable1771183324598'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD "type" nvarchar(255) NOT NULL CONSTRAINT "DF_a0acc597f8e6ccebe3859c98c16" DEFAULT 'Full-time'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "type"`);
    }

}
