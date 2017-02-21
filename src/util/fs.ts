'use strict'

import * as fs from 'fs'

import { Observable } from 'rxjs';

const UTF8 = 'utf8'

export function readUtf8File(path: string): Observable<string> {
  const readFunc = fs.readFile.bind(null, path, UTF8)
  return Observable.bindNodeCallback(readFunc)()
}

export function readJsonFile(path: string): Observable<any> {
  return readUtf8File(path).map(body => JSON.parse(body))
}

export function mkdir(path: string): Observable<{}> {
  return Observable.bindCallback(fs.exists)(path).flatMap(exists => {
    if (exists) {
      return Observable.of(path)
    } else {
      return Observable.bindNodeCallback(fs.mkdir)(path).map(() => path)
    }
  })
}