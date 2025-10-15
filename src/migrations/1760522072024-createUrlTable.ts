import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUrlTable1760522072024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "urls" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "user_id" uuid NOT NULL,
            "original_url" varchar (2048) NOT NULL,
            "short_url" varchar (255) NOT NULL UNIQUE,
            "is_active" boolean DEFAULT true,
            "created_at" timestamp with time zone DEFAULT now(),
            "deleted_at" timestamp with time zone DEFAULT NULL,
            "expires_at" timestamp with time zone NOT NULL, 
            "updated_at" timestamp with time zone DEFAULT NULL,
            CONSTRAINT "fk_user_urls"
            FOREIGN KEY ("user_id")
            REFERENCES "users" ("id") ON DELETE CASCADE            
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "urls";`);
  }
}
