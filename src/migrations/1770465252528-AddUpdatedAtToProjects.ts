import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUpdatedAtToProjects1770465252528 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('projects', new TableColumn({
            name: 'updated_at',
            type: 'datetime2',
            default: 'GETDATE()',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('projects', 'updated_at');
    }

}
