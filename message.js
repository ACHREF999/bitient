'use strict';

const Buffer = require('buffer').Buffer;
const torrentParser = require('./torrent-praser');
const util = require('./util');



module.exports.buildHandshake = torrent =>{
    const buffer = Buffer.alloc(68);

    buffer.writeUInt8(19,0);

    buffer.write('BitTorrent protocol',1);

    buffer.writeUInt32BE(0,20);
    buffer.writeUInt32BE(0,24);


    torrentParser.infoHash(torrent).copy(buffer,28);

    buffer.write(util.genId(),48);



}

module.exports.buildChoke = () =>{

    const buffer = Buffer.alloc(5);

    // REMEMBER  4 BYTES FOR LENGTH OF MESSAGE
    buffer.writeUInt32BE(1,0);

    // 1 BYTE FOR MESSAGE ID 
    buffer.writeInt8(0,4);



    // MESSAGE PAYLOAD
    return buffer;

}

module.exports.buildUnchoke = () =>{
    const buffer = Buffer.alloc(5);

    buffer.writeUInt32BE(1,0);
    buffer.writeInt8(1,4);

    return buffer;
}


module.exports.buildInterested = () => {

    const buffer = Buffer.alloc(5);

    // pstrlen
    buffer.writeUInt32BE(1,0);

    buffer.writeUInt8(2,4);

    return buffer;

}


module.exports.buildUninterested = ()=>{
    const buffer = Buffer.alloc(5);

    buffer.writeUInt32BE(1,0)

    buffer.writeInt8(3,4);

    return buffer;

}



module.exports.buildHave = (payload) => {
    const buffer = Buffer.alloc(9);
    buffer.writeUInt32BE(5,0);

    buffer.writeInt8(4,4);
    
    buffer.writeUInt32BE(payload,5)

    return buffer;
}




// we are expecting a buffer as input
module.exports.buildBitfield = (bitfield) =>{
    
    // 14 bytes + 4 of the length excluded

    const buffer = Buffer.alloc(14);

    // we are writing the length in the buffer 
    buffer.writeUInt32BE(bitfield.length + 1 ,0);


    // now we are writing the 5,4 
    buffer.writeUInt8(5,4);


    // we are copying the payload in the buffer
    bitfield.copy(buffer,5);


    return buffer;
}


module.exports.buildRequest = (payload)=>{

    const buffer = Buffer.alloc(17);

    // the length is 13 +...
    buffer.writeUInt32BE(13,0);


    // message id is 6
    buffer.writeUInt8(6,4);

    buffer.writeUInt32BE(payload.index,5);


    buffer.writeUInt32BE(payload.begin,9);

    // now we write the payload in the buffer;
    buffer.writeUInt32BE(payload.length,13);

    return buffer;
}


module.exports.buildPiece = (payload)=>{
    const buffer = Buffer.alloc(payload.block.length+13);

    buffer.writeUInt32BE(payloa.block.length +9 ,0);

    buffer.writeUInt8(7,4);

    buffer.writeUInt32BE(payload.index,5);

    buffer.writeUInt32BE(payload.begin,9);


    payload.block.copy(buffer,13);


    return buffer;
}


module.exports.buildCancel = payload =>{
    const buffer = Buffer.alloc(17);

    buffer.writeUInt32BE(13,0);

    buffer.writeUInt8(8,4);
    
    buffer.writeUInt32BE(payload.index,5);

    buffer.writeUInt32BE(payload.begin,9);

    buffer.writeUInt32BE(payload.length, 13);

    return buffer;
}

module.exports.buildPort = payload =>{
    const buffer = Buffer.alloc(7);


    buffer.writeUInt32BE(3,0);

    buffer.writeInt8(9,4);


    buffer.writeUInt16BE(payload,5);

    return buffer;


}