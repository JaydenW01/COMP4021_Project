export default class Player {
    constructor(playerNo) {
        this.colour = null;
        this.playerNo = playerNo;
        this.username = null;
        this.displayName = null;
        this.x = playerNo == 1 ? 0 : 12;
        this.y = playerNo == 1 ? 0 : 10;
        this.facing = "down";
        this.health = 3;
        this.cheat = false;
        this.ability = null;
        this.points = 0;
    }

    reset() {
        this.colour = null;
        this.username = null;
        this.displayName = null;
        this.x = this.playerNo == 1 ? 0 : 12;
        this.y = this.playerNo == 1 ? 0 : 10;
        this.facing = "down";
        this.health = 3;
        this.cheat = false;
        this.ability = null;
        this.points = 0;
    }

    startCheating(){
        this.cheat = true;
    }

    stopCheating(){
        this.cheat = false;
    }

    setUser(username,colour,displayName){
        this.username = username;
        this.colour = colour;
        this.displayName = displayName;
    }
 
    moveUp(){
        this.facing = "up";
        this.y -= 1;
    }
    moveDown(){
        this.facing = "down";
        this.y += 1;
    }
    moveLeft(){
        this.facing = "left";
        this.x -= 1;
    }
    moveRight(){
        this.facing = "right";
        this.x += 1;
    }
    faceUp(){
        this.facing = "up";
    }
    faceDown(){
        this.facing = "down";
    }
    faceLeft(){
        this.facing = "left";
    }
    faceRight(){
        this.facing = "right";
    }

    reduceHealth(){
        this.health -= 1;
        if (this.health == 0){
            return false;
        } else {
            return true;
        }
    }

    increaseHealth(){
        if (this.health==3){
            return
        } else {
            this.health += 1;
        }
    }

    playerInfo(){
        return {points:this.points,username:this.username,playerNo:this.playerNo,facing:this.facing,colour:this.colour,health:this.health,ability:this.ability,cheat:this.cheat,location:this.getPos()};
    }

    getAbility(newAbility){
        this.ability = newAbility;
        return;
    }

    getPos() {
        return {x:this.x,y:this.y};
    }

    setPoints(h){
        this.points = h;
    }

    getUsername(){
        return this.username;
    }

    getColour(){
        return this.colour;
    }

    checkExplosion(explosion){
        if (this.x === explosion.up.x && this.y ===  explosion.up.y){
            if (!this.reduceHealth()){
                return false;
            }
        } else if (this.x === explosion.down.x && this.y ===  explosion.down.y){
            if (!this.reduceHealth()){
                return false;
            }
        } else if (this.x === explosion.left.x && this.y ===  explosion.left.y){
            if (!this.reduceHealth()){
                return false;
            }
        } else if (this.x === explosion.right.x && this.y ===  explosion.right.y){
            if (!this.reduceHealth()){
                return false;
            }
        } else if (this.x === explosion.center.x && this.y ===  explosion.center.y){
            if (!this.reduceHealth()){
                return false;
            }
        }
        return true;
    }

    addPoints(points){
        this.points += points;
    }

    getPoints(){
        return this.points;
    }

    getDisplayName(){
        return this.displayName;
    }

}