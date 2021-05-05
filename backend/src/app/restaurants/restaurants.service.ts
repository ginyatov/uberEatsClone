import { Injectable } from '@nestjs/common';
import { RestaurantEntity } from './entities/restaurant.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { UserEntity } from '../users/entities/user.entity';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurants: Repository<RestaurantEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categories: Repository<CategoryEntity>,
  ) {}

  async createRestaurant(
    owner: UserEntity,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const categoryName = createRestaurantInput.categoryName
        .trim()
        .toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      let category = await this.categories.findOne({ slug: categorySlug });

      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName }),
        );
      }
      newRestaurant.category = category;

      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Ошибка создать ресторан',
      };
    }
  }
}
