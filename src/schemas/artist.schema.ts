import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type ArtistDocument = Artist & Document;

@Schema()
export class Artist {
  @Prop({required: true})
  name: string;

  @Prop({default: null})
  information: string;

  @Prop({default: false})
  isPublished: boolean;

  @Prop({default: null})
  photo: string;
}


export const ArtistSchema = SchemaFactory.createForClass(Artist);
