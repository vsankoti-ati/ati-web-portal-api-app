import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1700000001000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        default: 'NEWID()',
                    },
                    {
                        name: 'username',
                        type: 'nvarchar',
                        length: '255',
                        isUnique: true,
                    },
                    {
                        name: 'email',
                        type: 'nvarchar',
                        length: '255',
                        isUnique: true,
                    },
                    {
                        name: 'password_hash',
                        type: 'nvarchar',
                        length: '255',
                        isNullable: true,
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
                        length: '50',
                        default: "'Employee'",
                    },
                    {
                        name: 'auth_provider',
                        type: 'nvarchar',
                        length: '50',
                        default: "'Local'",
                    },
                    {
                        name: 'azure_ad_id',
                        type: 'nvarchar',
                        length: '255',
                        isNullable: true,
                        // Removed isUnique: true to allow multiple NULLs
                    },
                    {
                        name: 'is_active',
                        type: 'bit',
                        default: 1,
                    },
                    {
                        name: 'is_email_verified',
                        type: 'bit',
                        default: 0,
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
                    {
                        name: 'last_login',
                        type: 'datetime2',
                        isNullable: true,
                    },
                    {
                        name: 'reset_token',
                        type: 'nvarchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'reset_token_expiry',
                        type: 'datetime2',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}
