/* global fetch */
// TODO: Persist to local storage

const DEFAULT_DNS_PROXY = 'gateway.mauve.moe'
const NEWLINE_REGEX = /\r?\n/
const DAT_PROTOCOL = 'dat://'

module.exports = ({
  dnsProxy = DEFAULT_DNS_PROXY
} = {}) => {
  let cache = {}

  return {
    async resolveName (url, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      if (!cb) cb = noop

      const domain = url.slice(DAT_PROTOCOL.length)

      if (cache[domain]) {
        if (cb) {
          cb(null, cache[domain])
          return
        } else {
          return cache[domain]
        }
      }

      try {
        const toFetch = `//${dnsProxy}/${domain}/.well-known/dat`

        const response = await fetch(toFetch)

        const text = await response.text()

        const lines = text.split(NEWLINE_REGEX)

        const resolved = lines[0]

        cache[domain] = resolved

        if (cb) cb(null, resolved)
      } catch (e) {
        if (cb) cb(e)
        else throw e
      }
    },
    listCache () {
      return cache
    },
    flushCache () {
      cache = {}
    }
  }
}

function noop () {}
