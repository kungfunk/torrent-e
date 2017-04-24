'use strict'

const torrentStream = require('torrent-stream')
const magnetUri = require('magnet-uri')

const DOWNLOAD_PATH = 'D://Downloads'
const engineOpts = {
  path: DOWNLOAD_PATH
}

const Torrent = (magnet) => {
  const id = Date.now()
  const metadata = magnetUri.decode(magnet)

  return {
    id: id,
    name: metadata.name,
    files: [],
    magnetLink: magnet,
    filesize: 0,
    downloaded: 0,
    getTemplate: function() {
      let torrentItem = document.createElement('div');
      torrentItem.id = `torrent-id-${this.id}`
      torrentItem.className = 'torrent-item'
      torrentItem.innerHTML = `<div id="name">${this.name}</div>
        <div>Downloaded bytes: <span id="downloaded-bytes-counter-${this.id}">0</span> of <span id="total-filesize-${this.id}">${this.filesize}</span></div>`

      return torrentItem
    },

    setFilesize: function() {
      this.files.forEach((file) => {
          this.filesize += file.length
      })
    },

    updateDownloadedBytes: function(bytes) {
      this.downloaded = bytes
      document.getElementById(`downloaded-bytes-counter-${id}`).innerHTML = bytes
    },

    start: function() {
      this.files.forEach((file) => {
        this.filesize += file.length
        file.createReadStream()
      })
    }
  }
}

const getMagnetLinkValue = () => {
  return document.getElementById('magnet-link').value
}

const cleanMagnetLinkValue = () => {
  document.getElementById('magnet-link').value = ''
}

const addTorrentItem = (torrentItem) => {
  document.getElementById('torrent-list').append(torrentItem)
}

const readMagnetLink = () => {
  const link = getMagnetLinkValue()
  const engine = torrentStream(link, engineOpts)

  engine.on('ready', () => {
    cleanMagnetLinkValue()
    let torrent = Torrent(link)
    torrent.files = engine.files
    torrent.setFilesize()
    torrent.start()
    addTorrentItem(torrent.getTemplate())

    setInterval(() => {
      torrent.updateDownloadedBytes(engine.swarm.downloaded)
    }, 1000)
  })
}


document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('magnet-link-submit').addEventListener('click', readMagnetLink);
})
