'use strict'

import * as http from 'http'

import app from '../app'

const server = http.createServer(app)

server.listen(process.env.PORT || 3000, () => {
  var addr = server.address()
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  console.log('Listening on ' + bind)
})
