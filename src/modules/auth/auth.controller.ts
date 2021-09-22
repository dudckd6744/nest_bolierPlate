/* eslint-disable @typescript-eslint/no-empty-function */
import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
} from '@nestjs/swagger';
import { Response } from 'express';
import { User } from 'src/schemas/User';
import { AuthGuard_renewal } from 'src/utils/auth.guard';
import { ReqUser } from 'src/utils/user.decorater';

import { AuthService } from './auth.service';
import {
    CreateUserDto,
    errStatus,
    LoginUser,
    otherIdDto,
    PasswordUserDto,
    Success,
    tokenSuccess,
} from './dto/user.create.dto';

@Controller('api/auth')
export class AuthController {
    constructor(private userService: AuthService) {}

    @ApiOkResponse({ description: 'success', type: Success })
    @ApiBadRequestResponse({ description: 'false', type: errStatus })
    @ApiOperation({ summary: '회원가입' })
    @Post('/register')
    @UsePipes(ValidationPipe)
    registerUser(
        @Body() createUserDto: CreateUserDto,
    ): Promise<{ message: string }> {
        return this.userService.registerUser(createUserDto);
    }

    @ApiOkResponse({ description: 'success', type: tokenSuccess })
    @ApiBadRequestResponse({ description: 'false', type: errStatus })
    @ApiOperation({ summary: '로그인' })
    @Post('/login')
    @UsePipes(ValidationPipe)
    loginUser(@Body() loginUser: LoginUser): Promise<{ token: string }> {
        return this.userService.loginUser(loginUser);
    }

    // @Post('/login')//로그아웃
    // @UsePipes(ValidationPipe)
    // loginUser(@Body() loginUser: LoginUser): Promise<{ token: string }> {
    //     return this.userService.loginUser(loginUser);
    // }

    @ApiOkResponse({ description: 'success', type: Success })
    @ApiBadRequestResponse({ description: 'false', type: errStatus })
    @ApiOperation({ summary: '비밀번호 변경하기' })
    @ApiBearerAuth()
    @Put('/update_password')
    @UseGuards(AuthGuard_renewal)
    passwordUpdateUser(
        @ReqUser() user: User,
        @Body() passwordUserDto: PasswordUserDto,
    ): Promise<{ message: string }> {
        return this.userService.passwordUpdateUser(user, passwordUserDto);
    }

    @ApiOkResponse({ description: 'success', type: Success })
    @ApiBadRequestResponse({ description: 'false', type: errStatus })
    @ApiOperation({ summary: '유저 팔로우 하기' })
    @ApiBody({ type: otherIdDto })
    @ApiBearerAuth()
    @Post('/follow')
    @UseGuards(AuthGuard_renewal)
    followUser(
        @ReqUser() user: User,
        @Body('othersId') othersId: string,
    ): Promise<{ message: string }> {
        return this.userService.followUser(user, othersId);
    }

    @ApiOkResponse({ description: 'success', type: Success })
    @ApiBadRequestResponse({ description: 'false', type: errStatus })
    @ApiOperation({ summary: '유저 팔로우 비활성화' })
    @ApiBody({ type: otherIdDto })
    @ApiBearerAuth()
    @Delete('/unfollow')
    @UseGuards(AuthGuard_renewal)
    unfollowUser(
        @ReqUser() user: User,
        @Body('othersId') othersId: string,
    ): Promise<{ message: string }> {
        return this.userService.unfollowUser(user, othersId);
    }

    @Post('/test')
    @UseGuards(AuthGuard_renewal)
    test(@ReqUser() user: User) {
        return user;
    }

    @Get('/google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {}

    @Get('/google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        return res.redirect('http://localhost:8080');
    }

    @Get('/kakao')
    @UseGuards(AuthGuard('kakao'))
    async kakaoAuth(@Req() req) {
        console.log(req);
    }

    @Get('/kakao/redirect')
    @UseGuards(AuthGuard('kakao'))
    kakaoAuthRedirect(@Req() req, @Res() res: Response) {
        return this.userService.kakaoLogin(req, res);
    }
}
