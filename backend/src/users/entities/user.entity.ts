import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field()
  @Column({ length: 255 })
  name!: string;

  @Field()
  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ length: 255, select: false })
  password!: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at!: Date;
}
