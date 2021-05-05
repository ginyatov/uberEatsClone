import { CoreOutput } from '../../common/dtp/output.dto';
import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { VerificationEntity } from '../entities/verification.entity';

@ObjectType()
export class VerifyEmailOutput extends CoreOutput {}

@InputType()
export class VerifyEmailInput extends PickType(VerificationEntity, ['code']) {}
