import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { VerificationEntity } from './entities/verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, VerificationEntity])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
