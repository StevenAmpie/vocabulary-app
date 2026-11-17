import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { AlmanacQueryDto } from './almanac-query.dto';
import { AlmanacService } from './almanac.service';

@ApiTags('almanac')
@Controller('almanac')
export class AlmanacController {
  constructor(private readonly almanacService: AlmanacService) {}

  @Get('words')
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: AlmanacQueryDto) {
    return this.almanacService.list(user.id, query);
  }

  @Get('categories')
  categories(@CurrentUser() user: AuthenticatedUser) {
    return this.almanacService.categories(user.id);
  }

  @Get('words/:id')
  detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) wordId: string,
  ) {
    return this.almanacService.detail(user.id, wordId);
  }
}
