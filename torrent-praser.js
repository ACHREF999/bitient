'use strict';


const fs = require('fs');
const bencode = require('bencode');
// const bignum = require('bignum');
// const bignum = require('bignum')
const BN = require('bn.js')

module.exports.open = (filepath)=>{
    return bencode.decode(fs.readFileSync(filepath));
};


module.exports.size = torrent =>{
    const size = torrent.info.files ? 
            torrent.info.files.map(file=>file.length).reduce((a,b)=>a+b): torrent.info.length;

    
    const bn = new BN(size);
    return Buffer.from(bn.toArrayLike(Buffer, 'be', 8));

    // return bignum.toBuffer(size,{size:8})
}

module.exports.infoHash = torrent =>{

    const info = bencode.encode(torrent.info);
    return crypto.createHash('sha1').update(info).digest();

}