import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import * as dotenv from 'dotenv';
import { configuration } from './config';
import { ContactsModule } from './contacts/contacts.module';
import { MailModule } from './mail/mail.module';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(
      /*  process.env.MONGO_URI,
      { connectionName: configuration.connectionName }, */
      'mongodb+srv://fezakibira:fezakibira@cluster0.1x1anc8.mongodb.net/?retryWrites=true&w=majority',
      { connectionName: configuration.connectionName },
    ),
    AuthModule,
    UsersModule,
    ContactsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
