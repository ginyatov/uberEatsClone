import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RestaurantEntity } from './entities/restaurant.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { RestaurantService } from './restaurants.service';
import { AuthUser } from '../auth/auth-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { Role } from '../auth/role.decorator';

@Resolver(() => RestaurantEntity)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: UserEntity,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }
}
