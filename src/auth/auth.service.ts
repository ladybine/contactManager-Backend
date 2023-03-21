import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/models/user.model';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private saltOrRounds = 10;

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(email);
    console.log('User ', user);
    const passwordValid = await bcrypt.compare(password, user.password);
    if (passwordValid) {
      return user;
    }
    return null;
  }

  async login(user: User): Promise<{ access_token: string; user: User }> {
    console.log(user);
    const payload = {
      email: user.email,
    };
    console.log('Payload ', payload);
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '24h' }),
      user,
    };
  }

  async signup({ email, password }: { email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(password, this.saltOrRounds);
    return this.usersService.addUser({
      email,
      password: hashedPassword,
    });
  }
}
