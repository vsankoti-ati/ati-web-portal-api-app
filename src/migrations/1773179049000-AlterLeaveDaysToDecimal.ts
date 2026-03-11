import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterLeaveDaysToDecimal1773179049000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing default constraint for used_days (DF_1b5cc042eeaf2bbdc2fc155b554)
        await queryRunner.query(`
            DECLARE @ConstraintName NVARCHAR(200)
            SELECT @ConstraintName = name 
            FROM sys.default_constraints 
            WHERE parent_object_id = OBJECT_ID('leaves') 
            AND parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('leaves') AND name = 'used_days')
            IF @ConstraintName IS NOT NULL
                EXEC('ALTER TABLE leaves DROP CONSTRAINT ' + @ConstraintName)
        `);

        // Alter total_days from int to decimal
        await queryRunner.query(`
            ALTER TABLE leaves 
            ALTER COLUMN total_days DECIMAL(5,2) NOT NULL
        `);

        // Alter used_days from int to decimal
        await queryRunner.query(`
            ALTER TABLE leaves 
            ALTER COLUMN used_days DECIMAL(5,2) NOT NULL
        `);

        // Alter remaining_days from int to decimal
        await queryRunner.query(`
            ALTER TABLE leaves 
            ALTER COLUMN remaining_days DECIMAL(5,2) NOT NULL
        `);

        // Re-add default constraint for used_days
        await queryRunner.query(`
            ALTER TABLE leaves 
            ADD CONSTRAINT DF_leaves_used_days DEFAULT 0.00 FOR used_days
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the default constraint we added
        await queryRunner.query(`
            DECLARE @ConstraintName NVARCHAR(200)
            SELECT @ConstraintName = name 
            FROM sys.default_constraints 
            WHERE parent_object_id = OBJECT_ID('leaves') 
            AND parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('leaves') AND name = 'used_days')
            IF @ConstraintName IS NOT NULL
                EXEC('ALTER TABLE leaves DROP CONSTRAINT ' + @ConstraintName)
        `);

        // Revert remaining_days back to int
        await queryRunner.query(`
            ALTER TABLE leaves 
            ALTER COLUMN remaining_days INT NOT NULL
        `);

        // Revert used_days back to int
        await queryRunner.query(`
            ALTER TABLE leaves 
            ALTER COLUMN used_days INT NOT NULL
        `);

        // Revert total_days back to int
        await queryRunner.query(`
            ALTER TABLE leaves 
            ALTER COLUMN total_days INT NOT NULL
        `);

        // Re-add default constraint for used_days as int
        await queryRunner.query(`
            ALTER TABLE leaves 
            ADD CONSTRAINT DF_leaves_used_days DEFAULT 0 FOR used_days
        `);
    }

}
