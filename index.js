const fs = require('fs')
const bencode = require('bencode');
const tracker  = require('./tracker');
const torrentPraser = require('./torrent-praser')
const download = require('./download')


const torrent = torrentPraser.open('pp.torrent');
const filepath = './downlods/'+torrent.info.name;

console.log(torrent.announce.toString('utf8'))

// tracker.getPeers(torrent , (Peers) => {
//     console.log('The list of peers : ', peers);
    
// })


download(torrent,filepath);