import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { v4 as uuidv4 } from 'uuid';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { UserEntity } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class VerificationEntity extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
