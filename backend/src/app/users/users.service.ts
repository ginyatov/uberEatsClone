import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dto/create-account.dto';
import { LoginInput } from './dto/login.dto';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { VerificationEntity } from './entities/verification.entity';
import { VerifyEmailOutput } from './dto/verify-email.dto';
import { UserProfileOutput } from './dto/user-profile.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(VerificationEntity)
    private readonly verification: Repository<VerificationEntity>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      const exists = await this.users.findOne({ email });

      if (exists) {
        return { ok: false, error: 'Этот email уже занят' };
      }

      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verification.save(
        this.verification.create({ user }),
      );

      this.mailService.sendVerificationEmail(user.email, verification.code);

      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Не можем создать аккаунт' };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.users.findOne(
        { email },
        {
          select: ['id', 'password'],
        },
      );

      if (!user) {
        return {
          ok: false,
          error: 'Пользователь не найден',
        };
      }

      const isCorrectPassword = await user.checkPassword(password);

      if (!isCorrectPassword) {
        return {
          ok: false,
          error: 'Неверный пароль',
        };
      }

      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
      };
    } catch (error) {
      return { ok: false, error: 'Ошибка логин' };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Пользователь не найден',
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);

      if (email) {
        const isExistingEmail = await this.users.findOne({ email });

        if (isExistingEmail) {
          return { ok: false, error: 'E-mail уже занят' };
        }

        user.email = email;
        user.verified = false;
        await this.verification.delete({ user: { id: user.id } });
        const verification = await this.verification.save(
          this.verification.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }

      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: 'Ошибка обновления аккаунта' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verification.findOne(
        { code },
        { relations: ['user'] },
      );

      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verification.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: 'Код не найден' };
    } catch (error) {
      return { ok: false, error: 'Ошибка проверки e-mail' };
    }
  }
}
