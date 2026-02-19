import { MigrationInterface, QueryRunner } from "typeorm";

export class AddREasonColumnToTimesshet1771467434231 implements MigrationInterface {
    name = 'AddREasonColumnToTimesshet1771467434231'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "timesheets" ADD "submitter_comments" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP CONSTRAINT "DF_53e354344b9ea90252e3fb078ff"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD CONSTRAINT "DF_53e354344b9ea90252e3fb078ff" DEFAULT 'Pending' FOR "status"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP CONSTRAINT "DF_53e354344b9ea90252e3fb078ff"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD CONSTRAINT "DF_53e354344b9ea90252e3fb078ff" DEFAULT 'Pending' FOR "status"`);
        await queryRunner.query(`ALTER TABLE "timesheets" DROP COLUMN "submitter_comments"`);
    }

}
