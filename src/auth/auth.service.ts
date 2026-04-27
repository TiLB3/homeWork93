import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async validateUser(username: string, pass: string) {
    const user = await this.userModel.findOne({ username });
    if (user && (await user.checkPassword(pass))) {
      user.generateToken();
      return await user.save();
    }
    return null;
  }
}
