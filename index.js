'use strict';

const fs = require('fs');
// import bencode from 'bencode';
const bencode = require('bencode');
const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;




const torrent = bencode.decode(fs.readFileSync('pp.torrent'));

const url = urlParse(torrent.announce.toString('utf8'));


const socket = dgram.createSocket('udp4');

const myMsg = Buffer.from('Hello world', 'utf8');

socket.send(myMsg,0,myMsg.length,url.port,url.host,(e)=>{
    console.log("This is the callback response : ",e);
})



socket.on('message',msg=>{
    console.log('message is ', msg);
})



// console.log(torrent.announce.toString('utf8'));