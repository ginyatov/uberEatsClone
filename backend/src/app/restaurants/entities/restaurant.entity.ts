import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { CategoryEntity } from './category.entity';
import { UserEntity } from '../../users/entities/user.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class RestaurantEntity extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => CategoryEntity, { nullable: true })
  @ManyToOne(
    () => CategoryEntity,
    category => category.restaurants,
    { nullable: true, onDelete: 'SET NULL' },
  )
  category: CategoryEntity;

  @Field(() => UserEntity)
  @ManyToOne(
    () => UserEntity,
    user => user.restaurants,
    { onDelete: 'CASCADE' },
  )
  owner: UserEntity;
}
