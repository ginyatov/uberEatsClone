import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { RestaurantEntity } from '../entities/restaurant.entity';
import { CoreOutput } from '../../common/dtp/output.dto';

@InputType()
export class CreateRestaurantInput extends PickType(RestaurantEntity, [
  'name',
  'coverImage',
  'address',
]) {
  @Field(() => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
