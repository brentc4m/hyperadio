'use strict'

import * as express from 'express'

import { SoundCloud } from './../soundcloud';

const router = express.Router()

router.get('/', (req, res, next) => {
  const soundCloud: SoundCloud = req.app.get('soundCloud')
  soundCloud.getFavorites().subscribe(
    result => res.json(result),
    error => {
      console.error(error)
      res.status(500).json({error: 'Internal server error'})
    }
  )
})

export default router