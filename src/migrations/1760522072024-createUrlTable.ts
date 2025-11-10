import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUrlTable1760522072024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "urls" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "user_id" uuid NOT NULL,
            "encrypted_url" varchar (2048) NOT NULL,
            "title" varchar (64) NOT NULL,
            "short_code" varchar (255) NOT NULL UNIQUE,
            "created_at" timestamp with time zone DEFAULT now(),
            "deleted_at" timestamp with time zone DEFAULT NULL,
            "original_url" VARCHAR(64) NOT NULL,
            "expires_at" timestamp with time zone NOT NULL, 
            "updated_at" timestamp with time zone DEFAULT NULL,
            "expiry_alerted_at" timestamp with time zone DEFAULT NULL,
            CONSTRAINT "fk_user_urls"
            FOREIGN KEY ("user_id")
            REFERENCES "users" ("id") ON DELETE CASCADE            
        );

      CREATE INDEX "IDX_urls_user_id" ON "urls" ("user_id");

      CREATE INDEX "IDX_urls_expires_at" ON "urls" ("expires_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_urls_expires_at";
      DROP INDEX IF EXISTS "IDX_urls_user_id";
      DROP TABLE "urls";`);
  }
}
