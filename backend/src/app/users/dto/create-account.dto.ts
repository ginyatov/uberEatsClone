import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { UserEntity } from '../entities/user.entity';
import { CoreOutput } from '../../common/dtp/output.dto';

@InputType()
export class CreateAccountInput extends PickType(UserEntity, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
