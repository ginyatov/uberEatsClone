import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtp/output.dto';
import { UserEntity } from '../entities/user.entity';

@ArgsType()
export class UserProfileInput {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
  @Field(() => UserEntity, { nullable: true })
  user?: UserEntity;
}
