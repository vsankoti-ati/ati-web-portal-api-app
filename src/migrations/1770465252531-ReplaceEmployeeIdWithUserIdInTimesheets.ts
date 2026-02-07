import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class ReplaceEmployeeIdWithUserIdInTimesheets1770465252531 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the foreign key constraint for employee_id
        const table = await queryRunner.getTable('timesheets');
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('employee_id') !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey('timesheets', foreignKey);
        }

        // Drop the employee_id column
        await queryRunner.dropColumn('timesheets', 'employee_id');

        // Add the user_id column
        await queryRunner.addColumn(
            'timesheets',
            new TableColumn({
                name: 'user_id',
                type: 'uniqueidentifier',
            }),
        );

        // Add foreign key constraint for user_id
        await queryRunner.createForeignKey(
            'timesheets',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the foreign key constraint for user_id
        const table = await queryRunner.getTable('timesheets');
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey('timesheets', foreignKey);
        }

        // Drop the user_id column
        await queryRunner.dropColumn('timesheets', 'user_id');

        // Add back the employee_id column
        await queryRunner.addColumn(
            'timesheets',
            new TableColumn({
                name: 'employee_id',
                type: 'uniqueidentifier',
            }),
        );

        // Add back foreign key constraint for employee_id
        await queryRunner.createForeignKey(
            'timesheets',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'employees',
                onDelete: 'CASCADE',
            }),
        );
    }
}
