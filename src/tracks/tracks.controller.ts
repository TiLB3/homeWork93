import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { Model } from 'mongoose';
import { Track, TrackDocument } from '../schemas/tracks.schema';
import { CreateTrackDto } from './create-track.dto';
import { PermitRoleGuard } from '../permit-role/permit-role.guard';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
  ) {}

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
    return this.trackModel.findById(id);
  }

  @UseGuards(TokenAuthGuard)
  @Post()
  async create(@Body() trackDto: CreateTrackDto) {
    const isFindAlbum = await this.albumModel.findById(trackDto.album);
    if (!isFindAlbum) throw new NotFoundException('unknown Album');

    if (
      trackDto.name.trim().length === 0 ||
      trackDto.album.length === 0 ||
      trackDto.duration.trim().length === 0 ||
      trackDto.trackNumber.trim().length === 0
    ) {
      throw new BadRequestException(
        'Required name, album id and duration and trackNumber.',
      );
    }

    const newArtist = new this.trackModel({
      name: trackDto.name,
      duration: trackDto.duration,
      album: trackDto.album,
      trackNumber: Number(trackDto.trackNumber),
    });
    return await newArtist.save();
  }

  @UseGuards(PermitRoleGuard)
  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return this.trackModel.findByIdAndDelete(id);
  }
}
