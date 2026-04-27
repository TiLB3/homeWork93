import type { Request } from 'express';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';
import type { RequestWithUser } from '../types';

@Controller('users')
export class UsersController {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  @Post()
  async registerUser(@Body() createUserDto: CreateUserDto) {
    const { username, password, displayName } = createUserDto;

    if (!username || !password || !displayName) {
      throw new BadRequestException(
        "'Username and password and DisplayName is required",
      );
    }

    const isExistUsername = await this.userModel.findOne({
      username: createUserDto.username,
    });

    if (isExistUsername) {
      throw new ConflictException('Username already exists');
    }

    const user = new this.userModel({
      username,
      password,
      displayName,
    });

    user.generateToken();

    return await user.save();
  }

  @UseGuards(AuthGuard('local'))
  @Post('sessions')
  login(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(TokenAuthGuard)
  @Delete('sessions')
  async logout(@Req() req: RequestWithUser) {
    const user = req.user;
    if (user) {
      user.token = '';
      await user.save();
    }
    return { message: 'Logged out successfully' };
  }
}
