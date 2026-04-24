import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document, Types} from 'mongoose';

export type TrackDocument = Track & Document;

@Schema()
export class Track {
  @Prop({required: true})
  name: string;

  @Prop({
    ref: "Album",
    required: [true, "Album id is required"],
  })
  album: Types.ObjectId;

  @Prop({required: false})
  isPublished: boolean;

  @Prop({required: true})
  duration: string;

  @Prop({required: true})
  trackNumber: number;
}


export const TrackSchema = SchemaFactory.createForClass(Track);
