import {Types} from "mongoose";

export class CreateTrackDto {
  name: string;
  album: Types.ObjectId;
  duration: string;
  trackNumber: string;
}