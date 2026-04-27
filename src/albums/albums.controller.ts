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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { CreateAlbumDto } from './create-album.dto';
import { PermitRoleGuard } from '../permit-role/permit-role.guard';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
  ) {}

  @Get()
  async getAll(@Query('artist') artist?: string) {
    const query: { artist?: string } = {};

    if (artist) {
      query.artist = artist;
    }

    return this.albumModel.find(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.albumModel.findById(id);
  }

  @UseGuards(TokenAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('albumCover', {
      storage: diskStorage({
        destination: './public/uploads/albums',
        filename: (_req, file, cb) => {
          const extension = path.extname(file.originalname);
          cb(null, randomUUID() + extension);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumDto: CreateAlbumDto,
  ) {
    const isFindArtist = await this.artistModel.findById(albumDto.artist);
    if (!isFindArtist) throw new NotFoundException('unknown Artist');

    if (
      albumDto.name.trim().length === 0 ||
      albumDto.artist.length === 0 ||
      albumDto.releaseDate.trim().length === 0
    ) {
      throw new BadRequestException('Required name, artist id and releaseDate');
    }

    const newArtist = new this.albumModel({
      name: albumDto.name,
      albumCover: file ? 'uploads/albums/' + file.filename : null,
      artist: albumDto.artist,
      releaseDate: Number(albumDto.releaseDate),
    });
    return await newArtist.save();
  }

  @UseGuards(PermitRoleGuard)
  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return this.albumModel.findByIdAndDelete(id);
  }
}
