/**
 * FaceDatas Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseFaceDatasController } from './face-data.controller';

@Module({})
export class BaseFaceDatasModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseFaceDatasController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseFaceDatasController } from './face-data.controller';
export {
  BaseFaceDatasService,
  type FaceDatasRowDto,
  type FaceDatasCreateData,
  type FaceDatasUpdateData,
} from './face-data.service';
