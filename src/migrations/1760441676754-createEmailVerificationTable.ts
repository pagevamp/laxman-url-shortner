import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEmailVerificationsTable1760600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table
    await queryRunner.createTable(
      new Table({
        name: 'email_verifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'expires_at',
            type: 'timestamp with time zone',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'email_verifications',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('email_verifications');
    const foreignKey = table!.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('email_verifications', foreignKey);
    }
    await queryRunner.dropTable('email_verifications');
  }
}
