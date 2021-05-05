import { Module } from '@nestjs/common';
import { RestaurantsResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { CategoryEntity } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantEntity, CategoryEntity])],
  providers: [RestaurantsResolver, RestaurantService],
})
export class RestaurantsModule {}
