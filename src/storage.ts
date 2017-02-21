
import * as path from 'path'
import * as fs from './util/fs'

import { Observable } from 'rxjs';
import { SoundCloudCredentials } from './soundcloud';

const SC_CREDS_NAME = 'sc_creds'

export class StorageService {
  private readonly dirPath: Observable<string>

  constructor(dirPath: string) {
    this.dirPath = fs.mkdir(dirPath)
  }

  getSoundCloudCredentials(): Observable<SoundCloudCredentials> {
    return this.filePath(SC_CREDS_NAME).flatMap(fs.readJsonFile)
  }

  private filePath(name: string): Observable<string> {
    return this.dirPath.map(dirPath => path.join(dirPath, `${name}.json`))
  }
}