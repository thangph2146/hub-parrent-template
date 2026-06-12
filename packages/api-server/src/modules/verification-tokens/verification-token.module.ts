/**
 * VerificationTokens Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseVerificationTokensController } from './verification-token.controller';

@Module({})
export class BaseVerificationTokensModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseVerificationTokensController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseVerificationTokensController } from './verification-token.controller';
export {
  BaseVerificationTokensService,
  type VerificationTokensRowDto,
  type VerificationTokensCreateData,
  type VerificationTokensUpdateData,
} from './verification-token.service';
