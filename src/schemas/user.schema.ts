import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { Document } from 'mongoose';

export interface UserMethods {
  generateToken: () => void;
  checkPassword: (password: string) => Promise<boolean>;
}

const SALT_WORK_FACTOR = 10;

export type UserDocument = User & Document & UserMethods;

@Schema()
export class User {
  @Prop({
    required: true,
    unique: true,
  })
  username: string;
  @Prop({
    required: true,
  })
  password: string;
  @Prop()
  token: string;
  @Prop()
  displayName: string;

  @Prop({ default: 'user' })
  role: 'admin' | 'user';
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.generateToken = function (this: UserDocument) {
  this.token = randomUUID();
};

UserSchema.methods.checkPassword = async function (
  this: UserDocument,
  password: string,
) {
  return bcrypt.compare(password, this.password);
};
UserSchema.pre<UserDocument>('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, token, ...rest } = ret;

    return rest;
  },
});
