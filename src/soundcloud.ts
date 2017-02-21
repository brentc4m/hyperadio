'use strict'

import { SoundCloudCredentials } from './soundcloud'
import { Options } from 'request'
import { Observable, ReplaySubject, Subject } from 'rxjs'

import * as http from './util/http'
import * as humps from 'humps'
import * as moment from 'moment'

const API_BASE = 'https://api.soundcloud.com'
const EXPIRE_BUFFER = moment.duration(10, 'minutes')

export interface SoundCloudCredentials {
  readonly clientId: string
  readonly clientSecret: string
  readonly username: string
  readonly password: string
  accessToken?: string
  expiresAt?: string
}

function credentialsValid(credentials: SoundCloudCredentials): boolean {
  return credentials.accessToken != null
    && credentials.expiresAt != null
    && moment(credentials.expiresAt).subtract(EXPIRE_BUFFER).isAfter(moment())
}

export class SoundCloud {
  private latestCredentials: Observable<SoundCloudCredentials>
  private refreshedCredentials: Observable<SoundCloudCredentials>

  constructor(credentials: Observable<SoundCloudCredentials>) {
    this.latestCredentials = credentials
    this.refreshedCredentials = this.createSharedRefresh()
  }

  public getFavorites(): Observable<Object> {
    // TODO: get favorites
    return this.getValidCredentials()
  }

  private getValidCredentials(): Observable<SoundCloudCredentials> {
    return this.latestCredentials.flatMap(latestCredentials => {
      if (credentialsValid(latestCredentials)) {
        return Observable.of(latestCredentials)
      } else {
        return this.refreshedCredentials
      }
    })
  }

  private createSharedRefresh(): Observable<SoundCloudCredentials> {
    return Observable.defer(() => {
      return this.latestCredentials.flatMap(latestCredentials => {
        console.log('Refreshing credentials')

        const authBody = {
          clientId: latestCredentials.clientId,
          clientSecret: latestCredentials.clientSecret,
          username: latestCredentials.username,
          password: latestCredentials.password,
          grantType: 'password'
        }

        const options = {
          url: `${API_BASE}/oauth2/token`,
          method: 'POST',
          json: true,
          form: humps.decamelizeKeys(authBody)
        }

        return http.request(options).expectSuccess().asBody()
          .map((response: Object) => humps.camelizeKeys(response))
          .map((tokenResponse: TokenResponse) => {
            const expiresIn =
              moment.duration(tokenResponse.expiresIn, 'seconds')

            return Object.assign({}, latestCredentials, {
              accessToken: tokenResponse.accessToken,
              expiresAt: moment().add(expiresIn)
            })
          })
          .do((newCredentials: SoundCloudCredentials) => {
            // TODO: better way?
            console.log('Caching new credentials')
            this.latestCredentials = Observable.of(newCredentials)
          })
      })
    }).publish().refCount()
  }
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  scope: string
}