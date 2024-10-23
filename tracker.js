'use strict';

const fs = require('fs');
// import bencode from 'bencode';
const bencode = require('bencode');
const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const Url = require('url');
const crypto = require('crypto');
const torrentPraser = require('./torrent-praser');
const util = require('./util')


module.exports.getPeers = (torrent,callback)=>{


    const raw_url = torrent.announce.toString('utf8');

    // console.log(url);

    const socket = dgram.createSocket('udp4');

    console.log('sending Connection Request')
    udpSend(socket,buildConnReq(),raw_url);
    console.log('Sent Connection Request ! ')





    socket.on('message',response=>{
        console.log(response);

        if(respType(response)==='connect'){
            const connResp =parseConnResp(response);
            
            const announceReq = buildAnnounceReq(connResp.connectionId,torrent);

            udpSend(socket,announceReq,raw_url);
            console.log('Connect Response , Sent Announce Req !')

        }else if(respType(response)==='announce'){
            const announceResp = parseAnnounceResp(response);
            console.log('Announce Sent ! ')
            callback(announceResp.peers);
        }

    })

}

function udpSend(socket,message,rawUrl,callback=()=>{}){

    const url = new Url.URL(rawUrl);
    console.log(url);
    socket.send(message,0,message.length,url.port|'443',url.hostname,callback);
    


}

function buildConnReq(){
    // we first allocate the buffer 16 bytes
    const buffer = Buffer.alloc(16);

    // we put that id number of  8 bytes
    buffer.writeUInt32BE(0x417,0);
    buffer.writeUInt32BE(0x27101980,4);
    
    // we write the action connect == 0
    buffer.writeUInt32BE(0,8);

    // no we write the transaction id which is just a random byytes

    crypto.randomBytes(4).copy(buffer,12);


    return buffer;
}

function buildAnnounceReq(connId,torrent,port=6881){

    const buffer = Buffer.allocUnsafe(98);

    // this is the connection id
    connId.copy(buffer,0);


    // this is the action :: announce
    buffer.writeUInt32BE(1,8);

    // transaction id
    crypto.randomBytes(4).copy(buffer,12);

    // info hash
    torrentPraser.infoHash(torrent).copy(buffer,16);

    // peerId
    util.genId().copy(buffer,36);

    // downloaded 
    Buffer.alloc(8).copy(buffer,56);

    // left
    torrentPraser.size(torrent).copy(buffer,64);

    //uploaded
    Buffer.alloc(8).copy(buffer,72);

    //event
    buffer.writeUInt32BE(0,80);

    // ip address
    buffer.writeUInt32BE(0,84);
    
    //key 
    crypto.randomBytes(4).copy(buffer,88);

    // num want
    buffer.writeInt32BE(-1,92);

    // port 
    buffer.writeUint16BE(port,96);



    return buffer;

}


function parseConnResp(response){
    return {
        action : response.readUInt32BE(0),
        transactionId : response.readUInt32BE(4),
        connectionId : response.slice(8)
    }
}


function parseAnnounceResp(response){
    function group(iterable,groupSize){
        let groups = [];

        for(let i = 0; i < iterable.length ; i+= groupSize){
            groups.push(iterable.slice(i,i+groupSize));
        }

        return groups;
        }
    
    return  {
        action : response.readUInt32BE(0),
        transactionId:response.readUInt32BE(4),
        interval : response.readUInt32BE(8),
        leechers : response.readUInt32BE(12),
        seeders  : response.readUInt32BE(16),
        peers  : group(response.slice(20),6).map(address=>{
            return {
                ip:address.slice(0,4).join('.'),
                port : address.readUInt16BE(4)
            }
        })

    }



}








function respType(response){
    const action = response.readUInt32BE(0);
    if(action === 0) return 'connect';
    if(action === 1) return 'announce';
}







// console.log(torrent.announce.toString('utf8'));