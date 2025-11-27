import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAddressesTable1700000003000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'addresses',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        default: 'NEWID()',
                    },
                    {
                        name: 'employee_id',
                        type: 'uniqueidentifier',
                    },
                    {
                        name: 'street',
                        type: 'nvarchar',
                        length: '255',
                    },
                    {
                        name: 'city',
                        type: 'nvarchar',
                        length: '100',
                    },
                    {
                        name: 'state',
                        type: 'nvarchar',
                        length: '100',
                    },
                    {
                        name: 'zip_code',
                        type: 'nvarchar',
                        length: '20',
                    },
                    {
                        name: 'country',
                        type: 'nvarchar',
                        length: '100',
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'addresses',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'employees',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('addresses');
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('employee_id') !== -1);
        await queryRunner.dropForeignKey('addresses', foreignKey);
        await queryRunner.dropTable('addresses');
    }
}
