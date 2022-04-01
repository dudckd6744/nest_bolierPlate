import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { errStatus } from 'src/resStatusDto/resStatus.dto';
import { User, UserSchema } from 'src/schemas/User';
import { anything, instance, mock, when } from 'ts-mockito';

import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUser } from './dto/user.dto';

describe('AuthService', () => {
    const mockUser = {
        id: '123qwe123',
        email: 'test@test.com',
        name: 'test',
        password:
            '$2a$10$VdM32CSoELHOm5V97RNfhuXchlM/.nhr3BDS.7QWvYDNRvnZf9p9e',
        profile: '',
        phone: '',
    } as User;
    const mockCreateUser: CreateUserDto = {
        email: 'test@test.com',
        name: 'test',
        password: '!@#qwe123',
        profile: '',
        phone: '',
    };
    const mockLoginUser: LoginUser = {
        email: 'test@test.com',
        password: '!@#qwe123',
    };
    let service: AuthService;
    const userRepository: AuthRepository = mock(AuthRepository);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                AuthRepository,
                {
                    provide: getModelToken(User.name),
                    useValue: userRepository,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });
    describe('회원가입', () => {
        it('registers success ', async () => {
            when(userRepository.findByEmailUser('test@test.com')).thenResolve(
                null,
            );
            when(userRepository.findByNameUser('test')).thenResolve(null);

            when(userRepository.createUser(mockCreateUser)).thenResolve(
                mockUser,
            );

            const stub = new AuthService(instance(userRepository));

            const test = await stub.registerUser(
                mockCreateUser as CreateUserDto,
            );

            expect(test).toEqual({ success: true });
        });
        it('registers email err ', async () => {
            when(userRepository.findByEmailUser('test@test.com')).thenResolve(
                mockUser as User,
            );
            when(userRepository.findByNameUser('test')).thenResolve(null);

            const stub = new AuthService(instance(userRepository));

            const test = await stub
                .registerUser(mockCreateUser as CreateUserDto)
                .then((data) => {
                    console.log(data);
                })
                .catch((err) => {
                    return err.response.message;
                });

            expect(test).toEqual('이미 해당 이메일이 존재합니다.');
        });

        it('registers Name err ', async () => {
            when(userRepository.findByEmailUser('test@test.com')).thenResolve(
                null,
            );
            when(userRepository.findByNameUser('test')).thenResolve(
                mockUser as User,
            );

            const stub = new AuthService(instance(userRepository));

            const test = await stub
                .registerUser(mockCreateUser as CreateUserDto)
                .then((data) => {
                    console.log(data);
                })
                .catch((err) => {
                    return err.response.message;
                });

            expect(test).toEqual('이미 해당 이름이 존재합니다.');
        });
    });

    describe('로그인', () => {
        it('login success ', async () => {
            when(userRepository.findByEmailUser('test@test.com')).thenResolve(
                mockUser as User,
            );

            const stub = new AuthService(instance(userRepository));

            const test = await stub.loginUser(mockLoginUser as LoginUser);

            expect(test).toHaveProperty('token');
        });
    });
});
