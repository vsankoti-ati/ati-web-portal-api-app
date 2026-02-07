import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEmployeesTable1700000002000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'employees',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        default: 'NEWID()',  
                    },
                    {
                        name: 'first_name',
                        type: 'nvarchar',
                        length: '100',
                    },
                    {
                        name: 'last_name',
                        type: 'nvarchar',
                        length: '100',
                    },
                    {
                        name: 'role',
                        type: 'nvarchar',
                        length: '100',
                    },
                    {
                        name: 'email_id',
                        type: 'nvarchar',
                        length: '255',
                        isUnique: true,
                    },
                    {
                        name: 'phone_number',
                        type: 'nvarchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'date_of_birth',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'date_of_joining',
                        type: 'date',
                    },
                    {
                        name: 'is_active',
                        type: 'bit',
                        default: 1,
                    },
                    {
                        name: 'created_at',
                        type: 'datetime2',
                        default: 'GETDATE()',
                    },
                    {
                        name: 'updated_at',
                        type: 'datetime2',
                        default: 'GETDATE()',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('employees');
    }
}
