const initialWalls = [
    {x:1,y:1},
    {x:3,y:1},
    {x:5,y:1},
    {x:7,y:1},
    {x:9,y:1},
    {x:11,y:1},
    {x:1,y:3},
    {x:3,y:3},
    {x:5,y:3},
    {x:7,y:3},
    {x:9,y:3},
    {x:11,y:3},
    {x:1,y:5},
    {x:3,y:5},
    {x:5,y:5},
    {x:7,y:5},
    {x:9,y:5},
    {x:11,y:5},
    {x:1,y:7},
    {x:3,y:7},
    {x:5,y:7},
    {x:7,y:7},
    {x:9,y:7},
    {x:11,y:7},
    {x:1,y:9},
    {x:3,y:9},
    {x:5,y:9},
    {x:7,y:9},
    {x:9,y:9},
    {x:11,y:9}
];

const initialBreakables = [
    {x:2,y:0},{x:3,y:0},{x:4,y:0},{x:5,y:0},{x:6,y:0},{x:7,y:0},{x:8,y:0},{x:9,y:0},{x:10,y:0},{x:11,y:0},{x:12,y:0},
    {x:2,y:1},{x:4,y:1},{x:6,y:1},{x:8,y:1},{x:10,y:1},{x:12,y:1},
    {x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:8,y:2},{x:9,y:2},{x:10,y:2},{x:11,y:2},{x:12,y:2},
    {x:0,y:3},{x:2,y:3},{x:4,y:3},{x:6,y:3},{x:8,y:3},{x:10,y:3},{x:12,y:3},
    {x:0,y:4},{x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4},{x:5,y:4},{x:6,y:4},{x:7,y:4},{x:8,y:4},{x:9,y:4},{x:10,y:4},{x:11,y:4},{x:12,y:4},
    {x:0,y:5},{x:2,y:5},{x:4,y:5},{x:6,y:5},{x:8,y:5},{x:10,y:5},{x:12,y:5},
    {x:0,y:6},{x:1,y:6},{x:2,y:6},{x:3,y:6},{x:4,y:6},{x:5,y:6},{x:6,y:6},{x:7,y:6},{x:8,y:6},{x:9,y:6},{x:10,y:6},{x:11,y:6},{x:12,y:6},
    {x:0,y:7},{x:2,y:7},{x:4,y:7},{x:6,y:7},{x:8,y:7},{x:10,y:7},{x:12,y:7},
    {x:0,y:8},{x:1,y:8},{x:2,y:8},{x:3,y:8},{x:4,y:8},{x:5,y:8},{x:6,y:8},{x:7,y:8},{x:8,y:8},{x:9,y:8},{x:10,y:8},{x:11,y:8},{x:12,y:8},
    {x:0,y:9},{x:2,y:9},{x:4,y:9},{x:6,y:9},{x:8,y:9},{x:10,y:9},
    {x:0,y:10},{x:1,y:10},{x:2,y:10},{x:3,y:10},{x:4,y:10},{x:5,y:10},{x:6,y:10},{x:7,y:10},{x:8,y:10},{x:9,y:10},{x:10,y:10}
];

export default class Gameboard {
    constructor() {
        this.walls = initialWalls;
        this.breakables = initialBreakables;
        this.player1Bomb = null;
        this.player2Bomb = null;
        this.coins = [];
        this.hearts = [];
    }

    reset() {
        this.walls = initialWalls;
        this.breakables = initialBreakables;
        this.player1Bomb = null;
        this.player2Bomb = null;
        this.coins = [];
        this.hearts = [];
    }

    findBlockByPos(x,y){
        if (x < 0 || y < 0){
            return "out of bound";
        }
        for (const wall of this.walls){
            if (wall.x === x && wall.y === y){
                return "wall";
            } 
        }
        for (const breakable of this.breakables){
            if (breakable.x === x && breakable.y === y){
                return "breakable";
            }
        }

        for (const coin of this.coins){
            if (coin.x === x && coin.y === y){
                return "coin";
            }
        }

        for (const heart of this.hearts){
            if (heart.x === x && heart.y === y){
                return "heart";
            }
        }
        return "walkable";
    }

    gameboardInfo() {
        return {breakables:this.breakables,bombs:[this.player1Bomb,this.player2Bomb],hearts:this.hearts,coins:this.coins};
    }

    // up : x,y-1
    // down: x,y+1
    // left: x-1,y
    // right: x+1,y

    checkWalkable(currentpos,direction){
        const currentX = currentpos.x;
        const currentY = currentpos.y;
        console.log(direction);
        if (direction === "up"){
            if (currentY === 0){ // already at the top
                return false;
            } else {
                if (this.findBlockByPos(currentX,currentY-1) === "wall" || this.findBlockByPos(currentX,currentY-1) === "breakable" || this.findBlockByPos(currentX,currentY-1) === "out of bound"){
                    return false;
                } else {
                    return true;
                }
            }
        } else if (direction === "down"){
            if (currentY === 10){ // already at the bottom
                return false;
            } else {
                if (this.findBlockByPos(currentX,currentY+1) === "wall" || this.findBlockByPos(currentX,currentY+1) === "breakable" || this.findBlockByPos(currentX,currentY+1) === "out of bound"){
                    return false;
                } else {
                    return true;
                }
            }
        } else if (direction === "left"){
            if (currentX === 0){ // already at the left-most
                return false;
            } else {
                if (this.findBlockByPos(currentX-1,currentY) === "wall" || this.findBlockByPos(currentX-1,currentY) === "breakable" || this.findBlockByPos(currentX-1,currentY) === "out of bound"){
                    return false;
                } else {
                    return true;
                }
            }
        } else if (direction === "right"){
            if (currentX === 12){ // already at the right-most
                return false;
            } else {
                if (this.findBlockByPos(currentX+1,currentY) === "wall" || this.findBlockByPos(currentX+1,currentY) === "breakable" || this.findBlockByPos(currentX+1,currentY) === "out of bound"){
                    return false;
                } else {
                    return true;
                }
            }
        }
    }
    

    removeBlockByPos(x,y){
        for (let i = 0; i < this.breakables.length;i++){
            if (this.breakables[i].x === x && this.breakables[i].y === y){
                if (Math.random() < 0.3){ // there is a 0.3 chance to drop an item
                    if (Math.random() > 0.5){
                        this.coins.push({x:this.breakables[i].x,y:this.breakables[i].y})
                    } else {
                        this.hearts.push({x:this.breakables[i].x,y:this.breakables[i].y})
                    }
                }
                this.breakables.splice(i,1);
                break;
            }
        }
        return;
    }   

    placeBomb(pos,id,playerNo) {
        if (playerNo === 1){
            this.player1Bomb = {x:pos.x,y:pos.y};
        } else if (playerNo === 2){
            this.player2Bomb = {x:pos.x,y:pos.y};
        }
        return this.gameboardInfo();
    }

    setOffBomb(playerNo) {
        let points = 0;
        let bombX = null;
        let bombY = null;
        if (playerNo === 1){
            bombX = this.player1Bomb.x;
            bombY = this.player1Bomb.y
            const up = this.findBlockByPos(bombX,bombY-1) !== "breakable" ? false : true;
            const down = this.findBlockByPos(bombX,bombY+1) !== "breakable" ? false : true;
            const left = this.findBlockByPos(bombX-1,bombY) !== "breakable" ? false : true;
            const right = this.findBlockByPos(bombX+1,bombY) !== "breakable" ? false : true;
            if (up){
                this.removeBlockByPos(bombX,bombY-1);
                points += 1;
            }
            if (down){
                this.removeBlockByPos(bombX,bombY+1);
                points += 1;
            }
            if (left){
                console.log("bomb left")
                this.removeBlockByPos(bombX-1,bombY);
                points += 1;
            }
            if (right){
                console.log("bomb left")
                this.removeBlockByPos(bombX+1,bombY);
                points += 1;
            }
        } else if (playerNo === 2){
            bombX = this.player2Bomb.x;
            bombY = this.player2Bomb.y
            const up = this.findBlockByPos(bombX,bombY-1) !== "breakable" ? false : true;
            const down = this.findBlockByPos(bombX,bombY+1) !== "breakable" ? false : true;
            const left = this.findBlockByPos(bombX-1,bombY) !== "breakable" ? false : true;
            const right = this.findBlockByPos(bombX+1,bombY) !== "breakable" ? false : true;
            if (up){
                this.removeBlockByPos(bombX,bombY-1);
                points += 1;
            }
            if (down){
                this.removeBlockByPos(bombX,bombY+1);
                points += 1;
            }
            if (left){
                this.removeBlockByPos(bombX-1,bombY);
                points += 1;
            }
            if (right){
                this.removeBlockByPos(bombX+1,bombY);
                points += 1;
            }
        }
        if (playerNo === 1){
            this.player1Bomb = null;
        } else if (playerNo === 2){
            this.player2Bomb = null;
        }
        return {up:{x:bombX,y:bombY-1},down:{x:bombX,y:bombY+1},left:{x:bombX-1,y:bombY},right:{x:bombX+1,y:bombY},center:{x:bombX,y:bombY},points:points};
    }

    deleteItem(x,y){
        for (let i = 0; i < this.coins.length;i++){
            if (this.coins[i].x === x && this.coins[i].y === y){
                this.coins.splice(i,1);
                break;
            }
        }
        for (let j = 0; j < this.hearts.length;j++){
            if (this.hearts[j].x === x && this.hearts[j].y === y){
                this.hearts.splice(j,1);
                break;
            }
        }

    }

}