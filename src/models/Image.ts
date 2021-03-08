import {
  Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, BeforeRemove, BeforeInsert
} from "typeorm";
import fs from 'fs';
import aws from 'aws-sdk';
import { promisify } from "util";
import path from 'path';
import Orphanage from "./Orphanage";


const s3 = new aws.S3();
@Entity("images")
export default class Image {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  name: string;

  @Column()
  size: number;

  @Column()
  key: string;

  @Column()
  url: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Orphanage, (orphanage) => orphanage.images)
  @JoinColumn({ name: "orphanage_id" })
  orphanage: Orphanage;

  @BeforeInsert()
  async validate() {
    if (!this.url) {
      this.url = `${process.env.APP_URL}/files/${this.key}`;
    }
  };

  @BeforeRemove()
  async validateDelete() {
    if (process.env.STORAGE_TYPE === 's3') {
      return s3
        .deleteObject({
          Bucket: 'happyupload',
          Key: this.key,
        })
        .promise();
    } else {
      return promisify(fs.unlink)(
        path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key)
      );
    }
  }
}
