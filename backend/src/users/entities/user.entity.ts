import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  Admin = 'admin',
  Collector = 'collector',
}

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Field()
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Field()
  @Column({ type: 'varchar', length: 255, default: '+880' })
  phone!: string;

  @Field(() => UserRole)
  @Column({ type: 'varchar', length: 32, default: UserRole.Collector })
  role!: UserRole;

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at!: Date;
}
