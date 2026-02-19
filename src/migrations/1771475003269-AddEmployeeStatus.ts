import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmployeeStatus1771475003269 implements MigrationInterface {
    name = 'AddEmployeeStatus1771475003269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD "employee_status" nvarchar(255) NOT NULL CONSTRAINT "DF_a00c399de435c66681302c88369" DEFAULT 'Active'`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "DF_a00c399de435c66681302c88369"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "employee_status"`);
    }

}
