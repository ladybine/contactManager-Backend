import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { configuration } from 'src/config';
import { User, UserDocument } from 'src/models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name, configuration.connectionName)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find();
  }

  async findOne(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({ email });
  }

  async addUser({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<User> {
    const newUser = new this.userModel({
      email,
      password,
    });
    return newUser.save();
  }

  async deleteUser(email: string) {
    return this.userModel.findOneAndDelete({ email });
  }
}
