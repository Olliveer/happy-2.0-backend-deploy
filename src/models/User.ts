import { sign } from "jsonwebtoken";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import authConfig from '../config/auth';


@Entity("users")
export default class User {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  password_reset_token: string;

  @Column({ nullable: true })
  password_reset_expires: Date;

  generateToken(): string {
    const { secret, expiresIn } = authConfig.jwt;
    return sign({ id: this.id }, secret, { expiresIn });
  }
}

