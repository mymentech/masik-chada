import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'bigint', name: 'user_id' })
  user_id!: number;

  @Column({ length: 128, name: 'token_hash', unique: true })
  token_hash!: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expires_at!: Date;

  @Column({ type: 'timestamptz', name: 'used_at', nullable: true })
  used_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at!: Date;
}
