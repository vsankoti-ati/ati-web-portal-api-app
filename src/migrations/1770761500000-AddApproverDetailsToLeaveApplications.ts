import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddApproverDetailsToLeaveApplications1770761500000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'leave_applications',
            new TableColumn({
                name: 'approver_name',
                type: 'nvarchar',
                length: 'MAX',
                isNullable: true,
            }),
        );

        await queryRunner.addColumn(
            'leave_applications',
            new TableColumn({
                name: 'approver_comments',
                type: 'nvarchar',
                length: 'MAX',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('leave_applications', 'approver_comments');
        await queryRunner.dropColumn('leave_applications', 'approver_name');
    }
}
