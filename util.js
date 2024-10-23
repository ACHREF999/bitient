'use strict'


const crypto = require('crypto');


let id = null;

// the client id should be the same until connection is closed 

// singleton pattern 

module.exports.genId = ()=>{
    if(!id){
        id = crypto.randomBytes(20);
        Buffer.from('-achref-souda-').copy(id,0);
    }
    return id;
}