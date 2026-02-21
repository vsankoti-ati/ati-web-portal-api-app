import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddressColums1771697186066 implements MigrationInterface {
    name = 'AddAddressColums1771697186066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD "address_line_one" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "address_line_two" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "city" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "state" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "postal_code" nvarchar(255)`);       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "postal_code"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "address_line_two"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "address_line_one"`);
    }

}
