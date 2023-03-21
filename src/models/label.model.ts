import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LabelDocument = HydratedDocument<Label>;

@Schema()
export class Label {
  @Prop({ required: true })
  name: string;
}

export const LabelSchema = SchemaFactory.createForClass(Label);
