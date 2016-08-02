
const $ = require('./common')
const needle = require('needle')
const Promise = require('bluebird')
Promise.promisifyAll(needle)

async function main () {
  $.say('Checking download URLs...')

  const versions = JSON.parse($.read_file('versions.json'))
  let bad = false
  await Promise.map(versions.versions, async function (version) {
    await Promise.map(['linux-src', 'windows-amd64', 'windows-386', 'darwin-amd64'], async function (platform) {
      const url = version[platform]
      const res = await needle.headAsync(url)

      if ([302, 200].indexOf(res.statusCode) === -1) {
        $.say(`bad (HTTP ${res.statusCode}): ${url}, ${res.statusCode}`)
        bad = true
      }
    })
  })

  if (bad) {
    $.say('some URLs were broken, bailing out')
    process.exit(1)
  }
  $.say('all URLs good, continuing...')
}

main()
