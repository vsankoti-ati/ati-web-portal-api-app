import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTimesheetStatusDefault1770919488380 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing constraint with lowercase 'draft' default
        await queryRunner.query(`ALTER TABLE "timesheets" DROP CONSTRAINT "DF_5323e538db5a38387d8aa302a4f"`);
        
        // Add new constraint with capitalized 'Draft' default
        await queryRunner.query(`ALTER TABLE "timesheets" ADD CONSTRAINT "DF_5323e538db5a38387d8aa302a4f" DEFAULT 'Draft' FOR "status"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the new constraint with capitalized 'Draft' default
        await queryRunner.query(`ALTER TABLE "timesheets" DROP CONSTRAINT "DF_5323e538db5a38387d8aa302a4f"`);
        
        // Restore the original constraint with lowercase 'draft' default
        await queryRunner.query(`ALTER TABLE "timesheets" ADD CONSTRAINT "DF_5323e538db5a38387d8aa302a4f" DEFAULT 'draft' FOR "status"`);
    }

}
