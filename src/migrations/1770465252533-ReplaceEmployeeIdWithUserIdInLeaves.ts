import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class ReplaceEmployeeIdWithUserIdInLeaves1770465252533 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update leaves table
        const leavesTable = await queryRunner.getTable('leaves');
        const leavesFk = leavesTable.foreignKeys.find(fk => fk.columnNames.indexOf('employee_id') !== -1);
        if (leavesFk) {
            await queryRunner.dropForeignKey('leaves', leavesFk);
        }
        await queryRunner.dropColumn('leaves', 'employee_id');
        await queryRunner.addColumn(
            'leaves',
            new TableColumn({
                name: 'user_id',
                type: 'uniqueidentifier',
            }),
        );
        await queryRunner.createForeignKey(
            'leaves',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        // Update leave_applications table
        const leaveAppsTable = await queryRunner.getTable('leave_applications');
        const leaveAppsFk = leaveAppsTable.foreignKeys.find(fk => fk.columnNames.indexOf('employee_id') !== -1);
        if (leaveAppsFk) {
            await queryRunner.dropForeignKey('leave_applications', leaveAppsFk);
        }
        await queryRunner.dropColumn('leave_applications', 'employee_id');
        await queryRunner.addColumn(
            'leave_applications',
            new TableColumn({
                name: 'user_id',
                type: 'uniqueidentifier',
            }),
        );
        await queryRunner.createForeignKey(
            'leave_applications',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert leave_applications table
        const leaveAppsTable = await queryRunner.getTable('leave_applications');
        const leaveAppsFk = leaveAppsTable.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
        if (leaveAppsFk) {
            await queryRunner.dropForeignKey('leave_applications', leaveAppsFk);
        }
        await queryRunner.dropColumn('leave_applications', 'user_id');
        await queryRunner.addColumn(
            'leave_applications',
            new TableColumn({
                name: 'employee_id',
                type: 'uniqueidentifier',
            }),
        );
        await queryRunner.createForeignKey(
            'leave_applications',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'employees',
                onDelete: 'CASCADE',
            }),
        );

        // Revert leaves table
        const leavesTable = await queryRunner.getTable('leaves');
        const leavesFk = leavesTable.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
        if (leavesFk) {
            await queryRunner.dropForeignKey('leaves', leavesFk);
        }
        await queryRunner.dropColumn('leaves', 'user_id');
        await queryRunner.addColumn(
            'leaves',
            new TableColumn({
                name: 'employee_id',
                type: 'uniqueidentifier',
            }),
        );
        await queryRunner.createForeignKey(
            'leaves',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'employees',
                onDelete: 'CASCADE',
            }),
        );
    }
}
