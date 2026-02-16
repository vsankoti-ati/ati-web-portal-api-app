import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkFromHomeRequestTable1771212941881 implements MigrationInterface {
    name = 'AddWorkFromHomeRequestTable1771212941881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "work_from_home_requests" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_f6873b62b08dcc91cc1bb92796c" DEFAULT NEWSEQUENTIALID(), "user_id" uniqueidentifier NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "reason" nvarchar(255) NOT NULL, "status" nvarchar(255) NOT NULL CONSTRAINT "DF_8da8ae1b5de323c07e127a8e474" DEFAULT 'Pending', "approved_by" nvarchar(255), "approver_name" nvarchar(255), "approver_comments" nvarchar(255), "approved_date" date, "created_at" datetime2 NOT NULL CONSTRAINT "DF_39e04feba0fc7b4d2866f27f8cb" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_c87d8496c40f5aba3848908e0c2" DEFAULT getdate(), CONSTRAINT "PK_f6873b62b08dcc91cc1bb92796c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "work_from_home_requests" ADD CONSTRAINT "FK_c03edeeea6505747ac81a62d135" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work_from_home_requests" DROP CONSTRAINT "FK_c03edeeea6505747ac81a62d135"`);
        await queryRunner.query(`DROP TABLE "work_from_home_requests"`);
    }

}
