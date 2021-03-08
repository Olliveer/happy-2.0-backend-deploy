import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createUsers1610833197601 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "integer",
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "password",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "password_reset_token",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "password_reset_expires",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "TIMESTAMP",
            isPrimary: false,
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "TIMESTAMP",
            isPrimary: false,
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}
