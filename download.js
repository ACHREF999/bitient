'use strict';


const net = require('net');
const Buffer = require('buffer').Buffer;
const tracker = require('./tracker');
const message = require('./message');
const Pieces = require('./pieces');
const Queue = require('./queue');
const fs = require('fs');


// notice this is downloading all from peers
module.exports = (torrent , path )=>{
    
    tracker.getPeers(torrent,(peers )=>{
        const pieces = new Pieces(torrent);
        const file = fs.openSync(path,'w');
        peers.forEach(peer=>download(peer,torrent,pieces,file));
    })
}


function download(peer,torrent,pieces,file){
    const socket = net.socket();
    socket.connect(peer.port,peer.ip,()=>{
        
        socket.write(message.buildHandhake(torrent));
    })

    const queue = new Queue(torrent);

    onWholeMsg(socket,msg=>{

        return msgHandler(msg,socket,pieces,queue,file,torrent);

    })

}


function msgHandler(msg,socket,pieces,queue,file,torrent){
    if(isHandshake(msg)){
        socket.write(message.buildInterested());
    }else{
        const m = message.parse(msg);
        

        if(m.id===0) chokeHandler(socket);
        if(m.id===1) unchokeHandler(socket,pieces,queue);
        if(m.id===4) haveHandler(m.payload,socket,pieces,queue);
        if(m.id===5) bitfieldHandler(m.payload,socket,pieces,queue);
        if(m.id===7) pieceHandler(socket,pieces,queue,torrent,m.payload,file); //socket , pieces,queue,torrent,pb
    }
}


function isHandshake(msg){
    return msg.length === msg.readUInt8(0) + 49 && msg.toString('utf8',1) === 'BitTorrent protocol';
}

function onWholeMsg(socket,callback){

    let savedBuffer = Buffer.alloc(0);
    let handshake = true;


    socket.on('data',receievedBuffer =>{
        const msgLen = ()=>handshake?savedBuffer.readUInt8(0)+49 : savedBuffer.readUInt32BE(0)+4;

        savedBuffer = Buffer.concat([savedBuffer,receievedBuffer]);

        while(savedBuffer.length>=4 && savedBuffer.length >= msgLen()){
            callback(savedBuffer.slice(0,msgLen()));
            savedBuffer = savedBuffer.slice(msgLen());
            handshake = false;
        }

    })

}

function chokeHandler(socket){
    socket.end();

}

function unchokeHandler(socket,pieces,queue){
    queue.choked = false;

    requestPiece(socket,pieces,queue);

}

function haveHandler(socket , pieces,queue,payload){

    const pieceIndex = payload.readUInt32BE(0);
    // queue.push(pieceIndex);
    const queueEmpty = queuelength===0;
    queue.queue(pieceIndex);
    // if(queue.length==1){
    //     requestPiece(socket,requested,queue);
    // }

    // if(!requested[pieceIndex]){
    //     socket.write(message.buildRequest(pieceIndex));
    // }

    // requested[pieceIndex]=true;


    if(queueEmpty) requestPiece(socket,pieces,queue);
}





function bitfieldHandler(socket,pieces,queue,payload){

    const queueEmpty = queue.length===0;

    payload.forEach((byte,i)=>{
        for(let j = 0;j<8;j++){
            if(byte%2) queue.queue(i*8+7-j); // wtf  ? its easy , the payloa is a bitmap ; meaning we need to convert the position of the bit j in the byte i in the payload to a 1 or 0 aka true or false which pieces does that peer has!!!

            byte = Math.floor(byte/2); // shift right
        }
    })
    if(queueEmpty) requestPiece(socket,pieces,queue);

}

function pieceHandler(socket , pieces,queue,torrent,pb,file){
    console.log(pb); // bruv

    pieces.addRecieved(pb);

    const offset = pb.index*torrent.info['piece length'] + pb.begin;

    fs.write(file,pb.block,0,pb.block.length,offset,()=>{})

    if(pieces.isDone()){
        socket.end();
        console.log('DONE!');
        try{
            fs.closeSync(file);
        }
        catch(e){
            
        }

    }else{
        requestPiece(socket,pieces,queue);
    }

    // queue.shift();
    // requestPiece(socket,requested,queue);

}

function requestPiece(socket,pieces,queue){
    if(queue.choked) return null;

    while(queue.length()){
        const pieceBlock = queue.deque();

        if(pieces.needed(pieceBlock)){
            socket.write(message.buildRequest(pieceBlock));
            
            pieces.addRequested(pieceBlock);
            break;
        }
    }
    // if(requested[queue[0]]){
    //     queue.shift();
    // }else{
    //     socket.write(message.buildRequest(pieceIndex));
    // }
}
