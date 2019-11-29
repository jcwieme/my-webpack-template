import log from './parts/log'
import '../scss/app.scss'

const a = 'coucou'

log(a)

if (module.hot) {
  module.hot.accept('./parts/log.js', function () {
    console.log('Accepting the updated printMe module!')
    log(a)
  })
}
