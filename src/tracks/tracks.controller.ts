import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query
} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Album, AlbumDocument} from "../schemas/album.schema";
import {Model} from "mongoose";
import {Track, TrackDocument} from "../schemas/tracks.schema";
import {CreateTrackDto} from "./create-track.dto";

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
  ) {
  }

  @Get()
  async getAll(@Query('album') album?: string) {
    const query: { album?: string } = {};

    if (album) {
      query.album = album;
    }

    return this.trackModel.find(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.trackModel.findById(id)
  }

  @Post()
  async create(
    @Body() trackDto: CreateTrackDto) {

    const isFindAlbum = await this.albumModel.findById(trackDto.album);
    if (!isFindAlbum) throw new NotFoundException('unknown Album');

    const newArtist = new this.trackModel({
      name: trackDto.name,
      duration: trackDto.duration,
      album: trackDto.album,
      trackNumber: Number(trackDto.trackNumber),
    })
    return await newArtist.save()
  }

  @Delete(":id")
  async deleteOne(@Param('id') id: string) {
    return this.trackModel.findByIdAndDelete(id);
  }
}
