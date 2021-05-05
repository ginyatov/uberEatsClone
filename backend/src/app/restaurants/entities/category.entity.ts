import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { RestaurantEntity } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class CategoryEntity extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field(() => [RestaurantEntity], { nullable: true })
  @OneToMany(
    () => RestaurantEntity,
    restaurant => restaurant.category,
  )
  restaurants: RestaurantEntity[];
}
