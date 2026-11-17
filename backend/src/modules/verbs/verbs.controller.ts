import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VerbsService } from './verbs.service';

@ApiTags('verbs')
@Controller('verbs')
export class VerbsController {
  constructor(private readonly verbs: VerbsService) {}

  @Get()
  list() {
    return this.verbs.list();
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.verbs.detail(slug);
  }
}
