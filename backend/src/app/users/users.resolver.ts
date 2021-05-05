import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { UserEntity } from './entities/user.entity';
import { AuthUser } from '../auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dto/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dto/verify-email.dto';
import { Role } from '../auth/role.decorator';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => CreateAccountOutput)
  createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @Query(() => UserEntity)
  @Role(['Any'])
  me(@AuthUser() authUser: UserEntity) {
    return authUser;
  }

  @Query(() => UserProfileOutput)
  @Role(['Any'])
  userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.usersService.findById(userProfileInput.userId);
  }

  @Mutation(() => EditProfileOutput)
  @Role(['Any'])
  editProfile(
    @AuthUser() authUser: UserEntity,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation(() => VerifyEmailOutput)
  verifyEmail(
    @Args('input') { code }: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }
}
