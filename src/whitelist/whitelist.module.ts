import { Module } from '@nestjs/common'
import { WhitelistRepository } from './whitelist.repository'

@Module({
  providers: [WhitelistRepository],
  exports: [WhitelistRepository],
})
export class WhitelistModule {}
