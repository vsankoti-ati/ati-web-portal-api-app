import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddEmployeeIdToUsers1700000008000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add employee_id column to users table
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'employee_id',
                type: 'uniqueidentifier',
                isNullable: true,
            })
        );

        // Add foreign key constraint
        await queryRunner.createForeignKey(
            'users',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'employees',
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Find and drop the foreign key
        const table = await queryRunner.getTable('users');
        const foreignKey = table?.foreignKeys.find(
            fk => fk.columnNames.indexOf('employee_id') !== -1
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey('users', foreignKey);
        }

        // Drop the employee_id column
        await queryRunner.dropColumn('users', 'employee_id');
    }
}
