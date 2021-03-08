import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createOrphanages1602590079587 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "orphanages",
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
          },
          {
            name: "latitude",
            type: "varchar",
          },
          {
            name: "longitude",
            type: "varchar",
          },
          {
            name: "about",
            type: "text",
          },
          {
            name: "instructions",
            type: "text",
          },
          {
            name: "opening_hours",
            type: "varchar",
          },
          {
            name: "open_on_weekends",
            type: "boolean",
            default: false,
          },
          {
            name: "accept",
            type: "boolean",
            default: false,
            isPrimary: false,
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
    await queryRunner.dropTable("orphanages");
  }
}
