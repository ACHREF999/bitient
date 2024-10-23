'use strict';


const net = require('net');
const Buffer = require('buffer').Buffer;
const tracker = require('./tracker');
const message = require('./message')

// notice this is downloading all from peers
module.exports = torrent =>{
    tracker.getPeers(torrent,(peers )=>{
        peers.forEach(peer=>download(peer,torrent));
    })
}


function download(peer,torrent){
    const socket = net.socket();
    socket.connect(peer.port,peer.ip,()=>{
        
        socket.write(message.buildHandhake(torrent));
    })

    onWholeMsg(socket,data=>{

        return msgHandler(msg,socket);

    })

}


function msgHandler(msg,socket){
    if(isHandshake(msg)){
        socket.write(message.buildInterested());
    }
}


function isHandshake(msg){
    return msg.length === msg.readUInt8(0) + 49 && msg.toString('utf8',1) === 'BitTorrent protocol';
}

function onWholeMsg(socket,callback){

    let savedBuffer = Buffer.alloc(0);
    let handshake = true;


    socket.on('data',receievedBuffer =>{
        const msgLen = ()=>handshake?savedBuffer.readUInt8(0)+49 : savedBuffer.readInt32BE(0)+4;

        savedBuffer = Buffer.concat([savedBuffer,receievedBuffer]);

        while(savedBuffer.length>=4 && savedBuffer.length >= msgLen()){
            callback(savedBuffer.slice(0,msgLen()));
            savedBuffer = savedBuffer.slice(msgLen());
            handshake = false;
        }

    })

}