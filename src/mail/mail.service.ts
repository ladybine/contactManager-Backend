import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { user } from './user.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  sendMail():void{
    this.mailerService.sendMail({
        to:'fezakibira@gmail.com',
        from:'fezakibira@gmail.com',
        subject:'testing nest mailerModule',
        text:'welcome',
        html:'<b>welxome</b>'
    })
  }


 /*  async sendUserConfirmation(user: user, token: string) {
    const url = `barbiyne@email.com/auth/confirm?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation',
      context: {
        name: user.name,
        url,
      },
    });
  } */
}
