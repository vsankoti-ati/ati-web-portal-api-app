import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHolidayCalendarTable1770465252529 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'holiday_calendar',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        default: 'NEWID()',
                    },
                    {
                        name: 'year',
                        type: 'int',
                    },
                    {
                        name: 'client',
                        type: 'nvarchar',
                        length: '100',
                    },
                    {
                        name: 'date',
                        type: 'date',
                    },
                    {
                        name: 'occasion',
                        type: 'nvarchar',
                        length: '255',
                    },
                    {
                        name: 'comment',
                        type: 'nvarchar',
                        length: 'MAX',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('holiday_calendar');
    }
}
