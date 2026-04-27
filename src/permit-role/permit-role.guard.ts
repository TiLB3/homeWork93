import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestWithUser } from '../types';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class PermitRoleGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.get('Authorization')?.trim();

    if (!token) return false;
    const user = await this.userModel.findOne({ token });
    if (!user) {
      return false;
    }

    if (user.role === 'user') {
      throw new ForbiddenException(
        'У вас недостаточно прав для выполнения этой операции',
      );
    }

    return true;
  }
}
