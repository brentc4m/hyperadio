'use strict'

import * as req from 'request'

import { Observable, Observer } from 'rxjs'

export interface HttpResponse {
  readonly response: req.RequestResponse,
  readonly body: any
}

export class HttpResult {
  readonly response: Observable<HttpResponse>

  constructor(response: Observable<HttpResponse>) {
    this.response = response
  }

  expectSuccess(): HttpResult {
    return new HttpResult(this.response.flatMap(response => {
      if (Math.floor(response.response.statusCode / 100) == 2) {
        return Observable.of(response)
      } else {
        return Observable.throw(
          new Error(`Unexpected status code: ${response.response.statusCode}\n${response.body}`))
      }
    }))
  }

  asBody(): Observable<any> {
    return this.response.map(response => response.body)
  }
}

export function request(options: req.Options): HttpResult {
  const response = Observable.create((observer: Observer<HttpResponse>) => {
      req(options, (err, res, body) => {
        if (err) {
          return observer.error(err)
        } else {
          observer.next({
            response: res,
            body: body
          })
          observer.complete()
        }
      })
  })

  return new HttpResult(response)
}