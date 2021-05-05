import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { VerificationEntity } from './entities/verification.entity';
import { JwtService } from '../jwt/jwt.service';
import { MailService } from '../mail/mail.service';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<UserEntity>;
  let verificationRepository: MockRepository<VerificationEntity>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(VerificationEntity),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(UserEntity));
    verificationRepository = module.get(getRepositoryToken(VerificationEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };
    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@mail.ru',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: 'Этот email уже занят',
      });
    });

    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationRepository.save.mockResolvedValue({
        code: 'code',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await service.createAccount(createAccountArgs);

      expect(result).toEqual({ ok: false, error: 'Не можем создать аккаунт' });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'test@example.com',
      password: '123123',
    };
    it('should fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: false,
        error: 'Пользователь не найден',
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);

      expect(result).toEqual({
        ok: false,
        error: 'Неверный пароль',
      });
    });

    it('should return token if password is correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({
        ok: true,
        token: 'signed-token',
      });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await service.login(loginArgs);

      expect(result).toEqual({
        ok: false,
        error: 'Ошибка логин',
      });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };

    it('should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: true,
        user: findByIdArgs,
      });
    });

    it('should fail if no user is found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: 'Пользователь не найден' });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'foo@bar.com',
        verified: true,
      };

      const editProfileArgs = {
        input: { email: 'fooNew@bar.com' },
        userId: 1,
      };

      const newVerification = {
        code: 'code',
      };

      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        input: { password: 'new' },
        userId: 1,
      };

      usersRepository.findOne.mockResolvedValue({ password: 'old' });

      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: 'foo@mail.ru' });

      expect(result).toEqual({
        ok: false,
        error: 'Ошибка обновления аккаунта',
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };
      verificationRepository.findOne.mockResolvedValue(mockedVerification);

      const result = await service.verifyEmail('');

      expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on verification not found', async () => {
      verificationRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Код не найден' });
    });

    it('should fail on exception', async () => {
      verificationRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Ошибка проверки e-mail' });
    });
  });
});
