'use strict'

import { SoundCloud } from './soundcloud';
import { StorageService } from './storage';

import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as logger from 'morgan'
import * as path from 'path'
import { Observable } from 'rxjs'

import index from './routes/index'

const notFoundHandler: express.RequestHandler = (req, res, next) => {
  var err = new Error('Not found')
  err['status'] = 404
  next(err)
}

const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  res.status(err['status'] || 500).json({message: err.message})
}

const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.use('/', index)

app.use(notFoundHandler)
app.use(errorHandler)

const storageService = new StorageService('data')
const soundCloud = new SoundCloud(storageService.getSoundCloudCredentials())

app.set('soundCloud', soundCloud)

export default app