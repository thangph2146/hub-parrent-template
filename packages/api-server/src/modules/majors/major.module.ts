/**
 * Majors Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseMajorsController } from './major.controller';

@Module({})
export class BaseMajorsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseMajorsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseMajorsController } from './major.controller';
export {
  BaseMajorsService,
  type MajorsRowDto,
  type MajorsCreateData,
  type MajorsUpdateData,
} from './major.service';
