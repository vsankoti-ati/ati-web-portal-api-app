import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterEmployee1770911387064 implements MigrationInterface {
    name = 'AlterEmployee1770911387064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD "admin_comments" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "geo_location" nvarchar(255) NOT NULL CONSTRAINT "DF_8383856b42c4493269e6d106059" DEFAULT 'India'`);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP CONSTRAINT "DF_53e354344b9ea90252e3fb078ff"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD CONSTRAINT "DF_53e354344b9ea90252e3fb078ff" DEFAULT 'Pending' FOR "status"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP CONSTRAINT "DF_53e354344b9ea90252e3fb078ff"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD CONSTRAINT "DF_53e354344b9ea90252e3fb078ff" DEFAULT 'Pending' FOR "status"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "DF_8383856b42c4493269e6d106059"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "geo_location"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "admin_comments"`);
    }

}
