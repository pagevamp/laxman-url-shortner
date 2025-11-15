import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailVerificationsTable1760600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "email_verifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL UNIQUE,
        "token" varchar(255) NOT NULL,
        "created_at" timestamp with time zone DEFAULT now(),
        "expires_at" timestamp with time zone NOT NULL,
        "deleted_at" timestamp with time zone DEFAULT NULL,
        CONSTRAINT "fk_user_email_verifications" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE
      );

      CREATE INDEX "IDX_email_verifications_token"
        ON "email_verifications" ("token");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_email_verifications_token";
      DROP TABLE "email_verifications";`);
  }
}
