import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterLeaveApplication1773353569164 implements MigrationInterface {
    name = 'AlterLeaveApplication1773353569164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_applications" ALTER COLUMN "days_requested" decimal(5,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_applications" ALTER COLUMN "days_requested" int NOT NULL`);
    }

}
