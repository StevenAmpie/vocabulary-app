import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database.module';
import { LearningModule } from './modules/learning/learning.module';
import { AuthModule } from './modules/auth/auth.module';
import { AlmanacModule } from './modules/almanac/almanac.module';
import { VerbsModule } from './modules/verbs/verbs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    LearningModule,
    AlmanacModule,
    VerbsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
