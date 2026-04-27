export class CreateUserDto {
  username: string;
  password: string;
  displayName: string;
  role: 'admin' | 'user';
}
