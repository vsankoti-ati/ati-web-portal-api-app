import { MigrationInterface, QueryRunner } from "typeorm";

export class Altertimesheetstable1770936728469 implements MigrationInterface {
    name = 'Altertimesheetstable1770936728469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "timesheets" ADD "approver_comments" nvarchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(`ALTER TABLE "timesheets" DROP COLUMN "approver_comments"`);
    }

}
