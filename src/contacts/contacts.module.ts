import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from 'src/models/contact.model';
import { configuration } from 'src/config';
import { Label, LabelSchema } from 'src/models/label.model';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Contact.name, schema: ContactSchema },
        { name: Label.name, schema: LabelSchema },
      ],
      configuration.connectionName,
    ),
    MulterModule.register({
      dest: '/upload',
    }),
   
  ],
  providers: [ContactsService],
  controllers: [ContactsController],
})
export class ContactsModule {}
