'use strict';


module.exports = class {

    constructor(torrent){
        // this.requested = new Array(size).fill(false);
        // this.recieved = new Array(size).fill(false);
        function builPiecesArray(){
            const nPieces = torrent.info.pieces.length / 20;
            const arr = new Array(nPieces).fill(null);
            return arr.map(
                (_,i)=> new Array(
                    tp.blocksPerPiece(torrent,i)
                    )
                    .fill(false));
            }
            // basically array of array of blocks bools
            this._requested = builPiecesArray();
            this._recieved = builPiecesArray();
    }

    addRequested(pieceBlock){
        // this.requested[pieceIndex] = true;
        const blockIndex = pieceBlock.begin / tp.BLOCK_LEN;

        this._requested[pieceBlock.index][blockIndex] = true;
    }

    addRecieved(pieceBlock){
        // this.recieved[pieceIndex] = true;
        const blockIndex = pieceBlock.begin / tp.BLOCK_LEN;
        this._recieved[pieceBlock.index][blockIndex] = true;
    
    }

    needed(pieceBlock){
        // if(this.requested.every(i=>i===true)){
        //     this.requested = this.recieved.slice();
        // }
        // return !this.requested[pieceIndex]

        if(this._requested.every(blocks=>blocks.every(block=>block))){
            this._requested = this.recieved.map(blocks=>blocks.slice());
        }
        const blockIndex = pieceBlock.begin / tp.BLOCK_LEN;

        return !this._requested[pieceBlock.index][blockIndex];
    }


    isDone(){
        // return this.recieved.every(i=>i===true);
        return this._recieved.every(blocks=>blocks.every(block=>block));
    }

}