export default class Gameboard {
    constructor(initialWalls,initialBreakables) {
        this.walls = initialWalls;
        this.breakables = initialBreakables;
        this.player1Bomb = null;
        this.player2Bomb = null;
        this.coins = [];
        this.hearts = [];
    }

    reset(w,b) {
        console.log("reset gameboard");
        this.walls = w;
        this.breakables = b;
        this.player1Bomb = null;
        this.player2Bomb = null;
        this.coins = [];
        this.hearts = [];
        console.log(this.breakables.length)
    }

    setBreakables(b){
        this.breakables = [];
        for (const i of b){
            this.breakables.push(i);
        }
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
                if (Math.random() < 0.5){ // there is a 0.3 chance to drop an item
                    console.log("item")
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
        let fires = [];
        let points = 0;
        let bombX = null;
        let bombY = null;
        if (playerNo === 1){
            bombX = this.player1Bomb.x;
            bombY = this.player1Bomb.y
            const up = this.findBlockByPos(bombX,bombY-1) === "wall" ? false : this.findBlockByPos(bombX,bombY-1) === "out of bound" ? false : true;
            const down = this.findBlockByPos(bombX,bombY+1) === "wall" ? false : this.findBlockByPos(bombX,bombY+1) === "out of bound" ? false : true;
            const left = this.findBlockByPos(bombX-1,bombY) === "wall" ? false : this.findBlockByPos(bombX-1,bombY) === "out of bound" ? false : true;
            const right = this.findBlockByPos(bombX+1,bombY) === "wall" ? false : this.findBlockByPos(bombX+1,bombY) === "out of bound" ? false : true;
            if (up){
                this.removeBlockByPos(bombX,bombY-1);
                fires.push({x:bombX,y:bombY-1});
                points += 1;
            }
            if (down){
                this.removeBlockByPos(bombX,bombY+1);
                fires.push({x:bombX,y:bombY+1});
                points += 1;
            }
            if (left){
                this.removeBlockByPos(bombX-1,bombY);
                fires.push({x:bombX-1,y:bombY});
                points += 1;
            }
            if (right){
                this.removeBlockByPos(bombX+1,bombY);
                fires.push({x:bombX+1,y:bombY});
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
                fires.push({x:bombX,y:bombY-1});
                points += 1;
            }
            if (down){
                this.removeBlockByPos(bombX,bombY+1);
                fires.push({x:bombX,y:bombY+1});
                points += 1;
            }
            if (left){
                this.removeBlockByPos(bombX-1,bombY);
                fires.push({x:bombX-1,y:bombY});
                points += 1;
            }
            if (right){
                this.removeBlockByPos(bombX+1,bombY);
                fires.push({x:bombX+1,y:bombY});
                points += 1;
            }
        }
        if (playerNo === 1){
            this.player1Bomb = null;
        } else if (playerNo === 2){
            this.player2Bomb = null;
        }
        return {up:{x:bombX,y:bombY-1},down:{x:bombX,y:bombY+1},left:{x:bombX-1,y:bombY},right:{x:bombX+1,y:bombY},center:{x:bombX,y:bombY},points:points,fires:fires};
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