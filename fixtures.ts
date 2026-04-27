import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './src/app.module';
import { User, UserDocument } from './src/schemas/user.schema';
import { Artist, ArtistDocument } from './src/schemas/artist.schema';
import { Album, AlbumDocument } from './src/schemas/album.schema';
import { Track, TrackDocument } from './src/schemas/tracks.schema';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    const artistModel = app.get<Model<ArtistDocument>>(
      getModelToken(Artist.name),
    );
    const albumModel = app.get<Model<AlbumDocument>>(getModelToken(Album.name));
    const trackModel = app.get<Model<TrackDocument>>(getModelToken(Track.name));

    await trackModel.deleteMany({});
    await albumModel.deleteMany({});
    await artistModel.deleteMany({});
    await userModel.deleteMany({});

    const admin = new userModel({
      username: 'admin',
      password: '123',
      role: 'admin',
      displayName: 'Administrator',
    });
    admin.generateToken();

    const normalUser = new userModel({
      username: 'joe',
      password: '123',
      role: 'user',
      displayName: 'Joe Doe',
    });
    normalUser.generateToken();

    await admin.save();
    await normalUser.save();

    const [eminem, britni] = await artistModel.create([
      {
        name: 'Eminem',
        isPublished: true,
        information: 'ddd',
      },
      {
        name: 'Britni',
        isPublished: true,
        information: 'ddd',
      },
    ]);

    const [album1, album2, album3, album4] = await albumModel.create([
      {
        name: 'The Slim Shady LP',
        releaseDate: 1999,
        artist: eminem._id,
        isPublished: true,
      },
      {
        name: 'The Marshall Mathers LP',
        releaseDate: 2000,
        artist: eminem._id,
        isPublished: true,
      },
      {
        name: '...Baby One More Time',
        releaseDate: 1999,
        artist: britni._id,
        isPublished: true,
      },
      {
        name: 'Oops!... I Did It Again',
        releaseDate: 2000,
        artist: britni._id,
        isPublished: true,
      },
    ]);

    await trackModel.create([
      {
        name: 'My Name Is',
        duration: '4:28',
        trackNumber: 1,
        album: album1._id,
        isPublished: true,
      },
      {
        name: 'Guilty Conscience',
        duration: '3:19',
        trackNumber: 2,
        album: album1._id,
        isPublished: true,
      },
      {
        name: 'Stan',
        duration: '6:44',
        trackNumber: 1,
        album: album2._id,
        isPublished: true,
      },
      {
        name: 'The Way I Am',
        duration: '4:50',
        trackNumber: 2,
        album: album2._id,
        isPublished: true,
      },
      {
        name: 'Baby One More Time',
        duration: '3:30',
        trackNumber: 1,
        album: album3._id,
        isPublished: true,
      },
      {
        name: 'Sometimes',
        duration: '4:05',
        trackNumber: 2,
        album: album3._id,
        isPublished: true,
      },
      {
        name: 'Oops!... I Did It Again',
        duration: '3:31',
        trackNumber: 1,
        album: album4._id,
        isPublished: true,
      },
      {
        name: 'Stronger',
        duration: '3:23',
        trackNumber: 2,
        album: album4._id,
        isPublished: true,
      },
    ]);

    console.log('Фикстуры успешно загружены!');
  } catch (e) {
    console.error('Ошибка при загрузке фикстур:', e);
  } finally {
    await app.close();
    process.exit(0);
  }
}

void run();
