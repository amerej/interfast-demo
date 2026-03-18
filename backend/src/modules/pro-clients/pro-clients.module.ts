import { Module } from '@nestjs/common';
import { ProClientsController } from './pro-clients.controller';
import { ProClientsService } from './pro-clients.service';

@Module({
  controllers: [ProClientsController],
  providers: [ProClientsService],
  exports: [ProClientsService],
})
export class ProClientsModule {}
