import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsTable1761545874535 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "url_analytics" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "url_id" uuid NOT NULL,
        "redirected_at" timestamp with time zone DEFAULT NOW(),
        "ip" VARCHAR(100) NOT NULL,
        "country" VARCHAR(40) NOT NULL,
        "device" VARCHAR(50) NOT NULL,
        "browser" VARCHAR(40) NOT NULL,
        "user_agent" VARCHAR(200) NOT NULL,
        CONSTRAINT "fk_url_analytics"
          FOREIGN KEY ("url_id") REFERENCES "urls" ("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "url_analytics"`);
  }
}
