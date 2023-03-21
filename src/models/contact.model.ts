import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Label } from './label.model';

export type ContactDocument = HydratedDocument<Contact>;

/* export enum StatusType {
  user = '',
  non_user = '',
}

export enum CategoryType {
  partner = 'Partenaire',
} */

@Schema()
export class Contact {
  _id: string;

  @Prop({ required: true })
  first_name: string;

  @Prop()
  middle_name: string;

  @Prop()
  last_name: string;

  @Prop({ default: [] })
  emails: string[];

  @Prop()
  country: string;

  @Prop()
  town: string;

  @Prop()
  province: string;
  @Prop()
  adress: string;

  @Prop()
  company: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], default: [] })
  labels: Label[];

  @Prop()
  status: string;

  @Prop()
  category: string;
  @Prop()
  groupe: string;

  @Prop({ default: [] })
  phones: { phone: string; label?: string }[];
  @Prop()
  flashApId: string;
}

export interface ContactInterface {
  first_name: string;

  middle_name: string;

  last_name: string;

  emails: string[];

  country: string;

  town: string;

  province: string;
  adress: string;

  company: string;

  status: string;

  category: string;
  groupe: string;

  phones: { phone: string; label?: string }[];
  flashApId: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
