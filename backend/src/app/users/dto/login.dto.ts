import { CoreOutput } from '../../common/dtp/output.dto';
import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { UserEntity } from '../entities/user.entity';

@InputType()
export class LoginInput extends PickType(UserEntity, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}
