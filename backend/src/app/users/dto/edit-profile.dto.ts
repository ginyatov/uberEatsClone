import { CoreOutput } from '../../common/dtp/output.dto';
import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { UserEntity } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

@InputType()
export class EditProfileInput extends PartialType(
  PickType(UserEntity, ['email', 'password']),
) {}
