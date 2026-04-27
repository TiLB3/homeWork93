import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User, UserDocument } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestWithUser } from '../types';

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.get('Authorization');

    const user = await this.userModel.findOne({ token });
    if (!user) {
      return false;
    }
    request.user = user;

    return true;
  }
}
