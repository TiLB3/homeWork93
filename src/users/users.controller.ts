import type { Request } from 'express';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';
import type { RequestWithUser } from '../types';
import { PermitRoleGuard } from '../permit-role/permit-role.guard';

@Controller('users')
export class UsersController {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  @Post()
  async registerUser(@Body() createUserDto: CreateUserDto) {
    const { username, password, displayName, role } = createUserDto;

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
      role,
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
