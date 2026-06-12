import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { BaseUploadsService } from './uploads.service';

class TestUploadsService extends BaseUploadsService {}

describe('BaseUploadsService', () => {
  let service: TestUploadsService;
  let storageRoot: string;
  const previousStorageDir = process.env.STORAGE_DIR;

  beforeEach(async () => {
    storageRoot = await mkdtemp(path.join(os.tmpdir(), 'api-server-uploads-spec-'));
    process.env.STORAGE_DIR = storageRoot;
    service = new TestUploadsService();
    await mkdir(path.join(storageRoot, 'uploads', 'images'), { recursive: true });
    await mkdir(path.join(storageRoot, 'uploads', 'files'), { recursive: true });
  });

  afterEach(async () => {
    await rm(storageRoot, { recursive: true, force: true });
    if (previousStorageDir === undefined) {
      delete process.env.STORAGE_DIR;
    } else {
      process.env.STORAGE_DIR = previousStorageDir;
    }
  });

  it('tao folder va listFolders theo prefix realm', async () => {
    const folder = await service.createFolder('Banner Home', undefined, 'images');
    expect(folder.folderPath).toBe('Banner-Home');

    const listed = await service.listFolders();
    expect(listed.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'images' }),
        expect.objectContaining({ path: 'Banner-Home' }),
      ]),
    );
  });

  it('saveFile + listImages tra ve url va metadata dung contract', async () => {
    const saved = await service.saveFile(
      {
        buffer: Buffer.from('hello'),
        originalname: 'avatar.png',
        mimetype: 'image/png',
      },
      'images/avatars',
      true,
      'https://example.test/api/uploads',
      '42',
    );

    expect(saved.url).toContain('https://example.test/api/uploads/images/avatars/');

    const result = await service.listImages({
      page: 1,
      limit: 10,
      serveBaseUrl: 'https://example.test/api/uploads',
      realm: 'images',
      folderPath: 'avatars',
      includeDescendants: true,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        relativePath: saved.relativePath,
        storageRealm: 'images',
        storageTab: 'avatars',
      }),
    );
  });

  it('bulkMoveFiles di chuyen file va bulkDeleteFiles xoa hang loat', async () => {
    const first = await service.saveFile(
      {
        buffer: Buffer.from('file-1'),
        originalname: 'one.txt',
        mimetype: 'text/plain',
      },
      'files/docs',
      true,
      '',
      '7',
    );
    const second = await service.saveFile(
      {
        buffer: Buffer.from('file-2'),
        originalname: 'two.txt',
        mimetype: 'text/plain',
      },
      'files/docs',
      true,
      '',
      '7',
    );

    const moved = await service.bulkMoveFiles(
      [first.relativePath, second.relativePath],
      'files/archive',
    );
    expect(moved.moved).toBe(2);

    const deleted = await service.bulkDeleteFiles([
      first.relativePath.replace('files/docs/', 'files/archive/'),
      second.relativePath.replace('files/docs/', 'files/archive/'),
    ]);
    expect(deleted.deleted).toBe(2);
    expect(deleted.failed).toBe(0);
  });

  it('reorganizeDateFolders flatten path nam/thang/ngay', async () => {
    const datedFile = path.join(
      storageRoot,
      'uploads',
      'images',
      'avatars',
      '2026',
      '06',
      '12',
      'photo.png',
    );
    await mkdir(path.dirname(datedFile), { recursive: true });
    await writeFile(datedFile, Buffer.from('img'));

    const preview = await service.reorganizeDateFolders({ dryRun: true });
    expect(preview.candidates).toBe(1);
    expect(preview.preview[0]).toEqual({
      from: 'images/avatars/2026/06/12/photo.png',
      to: 'images/avatars/photo.png',
    });

    const moved = await service.reorganizeDateFolders({ dryRun: false });
    expect(moved.moved).toBe(1);
    const targetInfo = await stat(
      path.join(storageRoot, 'uploads', 'images', 'avatars', 'photo.png'),
    );
    expect(targetInfo.isFile()).toBe(true);
  });

  it('exportArchive va importArchive round-trip tep ZIP', async () => {
    const saved = await service.saveFile(
      {
        buffer: Buffer.from('zip-me'),
        originalname: 'asset.txt',
        mimetype: 'text/plain',
      },
      'files/exported',
      true,
      '',
      '77',
    );

    const exported = await service.exportArchive();
    expect(exported.fileCount).toBe(1);

    await rm(storageRoot, { recursive: true, force: true });
    await mkdir(path.join(storageRoot, 'uploads', 'files'), { recursive: true });
    process.env.STORAGE_DIR = storageRoot;

    const imported = await service.importArchive(exported.buffer, {
      overwrite: true,
    });
    expect(imported.restored).toBe(1);

    const restoredBuffer = await readFile(
      path.join(storageRoot, 'uploads', saved.relativePath.replace(/\//g, path.sep)),
    );
    expect(restoredBuffer.toString()).toBe('zip-me');
  });


  it('snapshotRelativeFile copy duoc file noi bo', async () => {
    const source = await service.saveFile(
      {
        buffer: Buffer.from('copy'),
        originalname: 'copy.txt',
        mimetype: 'text/plain',
      },
      'files/source',
      true,
    );

    const copied = await service.snapshotRelativeFile(
      source.relativePath,
      'files/copied/copied.txt',
    );
    expect(copied).toBe(true);

    const content = await readFile(
      path.join(storageRoot, 'uploads', 'files', 'copied', 'copied.txt'),
      'utf8',
    );
    expect(content).toBe('copy');
  });
});
