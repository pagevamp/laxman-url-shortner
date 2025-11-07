import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsTable1761545874535 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "url_analytics" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "url_id" uuid NOT NULL,
        "redirected_at" timestamp with time zone DEFAULT NOW(),
        "ip" VARCHAR(100) ,
        "country" VARCHAR(40) ,
        "os" VARCHAR(40) ,
        "device" VARCHAR(50),
        "browser" VARCHAR(40) ,
        "user_agent" VARCHAR(200),
        CONSTRAINT "fk_url_analytics"
          FOREIGN KEY ("url_id") REFERENCES "urls" ("id") ON DELETE CASCADE
      );

      CREATE INDEX "IDX_url_analytics_url_id" ON "url_analytics" ("url_id");

      CREATE INDEX "IDX_url_analytics_redirected_at" ON "url_analytics" ("redirected_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_url_analytics_redirected_at";
      DROP INDEX IF EXISTS "IDX_url_analytics_url_id";
      DROP TABLE "url_analytics"`);
  }
}
