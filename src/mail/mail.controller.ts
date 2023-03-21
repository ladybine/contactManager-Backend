import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { Get } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post()
  sendMail():void {
    return this.mailService.sendMail();
  }
}
