import { MigrationInterface, QueryRunner } from "typeorm";

export class Alterusertable1770932561237 implements MigrationInterface {
    name = 'Alterusertable1770932561237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "geo_location" nvarchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "geo_location"`);
    }

}
