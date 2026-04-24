import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Artist, ArtistDocument} from "../schemas/artist.schema";
import {Model} from "mongoose";
import {CreateArtistDto} from "./create-artist.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {diskStorage} from "multer";

@Controller('artists')
export class ArtistsController {

  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>
  ) {
  }

  @Get()
  async getAll() {
    return this.artistModel.find();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.artistModel.findById(id)
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './public/uploads/artists',
        filename: async (_req, file, cb) => {
          const extension = path.extname(file.originalname);
          cb(null, randomUUID() + extension);
        }
      })
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistDto: CreateArtistDto) {
    if (artistDto.name.trim().length === 0) {
      throw new BadRequestException("Name is Required");
    }


    const newArtist = new this.artistModel({
      name: artistDto.name,
      photo: file ? 'uploads/artists/' + file.filename : null,
      information: artistDto.information,
    })
    return newArtist.save()
  }

  @Delete(":id")
  async deleteOne(@Param('id') id: string) {
    return this.artistModel.findByIdAndDelete(id);
  }
}
