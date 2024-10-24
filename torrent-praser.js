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

module.exports.BLOCK_LEN = Math.pow(2,14);

module.exports.pieceLen = (torrent,pieceIndex)=>{
    const totalLength = new BN(this.size(torrent)).toNumber();
    const pieceLength = torrent.info['piece length'];

    const lastPieceLength = totalLength % pieceLength;

    const lastPieceIndex = Math.floor(totalLength/pieceLength);

    return lastPieceIndex === pieceIndex ? lastPieceLength : pieceLength;
}


module.exports.blocksPerPiece = (torrent,pieceIndex)=>{
    const pieceLength = this.pieceLen(torrent,pieceIndex);
    return Math.ceil(pieceLength/this.BLOCK_LEN);
}

module.exports.blockLen = (torrent,pieceIndex,blockIndex)=>{
    const pieceLength = this.pieceLen(torrent,pieceIndex);
    const lastPieceLength = pieceLength % this.BLOCK_LEN;
    const lastPieceIndex = Math.floor(pieceLength/this.BLOCK_LEN);
    
    return blockIndex === lastPieceIndex ? lastPieceLength : this.BLOCK_LEN;
}