import { Module } from '@nestjs/common';
import { AlmanacController } from './almanac.controller';
import { AlmanacService } from './almanac.service';

@Module({
  controllers: [AlmanacController],
  providers: [AlmanacService],
})
export class AlmanacModule {}
