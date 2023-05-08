export default class Player {
    constructor(playerNo) {
        this.colour = null;
        this.playerNo = playerNo;
        this.username = null;
        this.x = playerNo == 0 ? 0 : 12;
        this.y = playerNo == 0 ? 0 : 10;
        this.facing = "down";
        this.health = 3;
        this.cheat = false;
        this.ability = null;
    }

    setUser(username,colour){
        this.username = username;
        this.colour = colour;
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
        if (this.health-1 == 0){
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
        return {playerNo:this.playerNo,facing:this.facing,colour:this.colour,health:this.health,ability:this.ability,cheat:this.cheat,location:this.getPos()};
    }

    getAbility(newAbility){
        this.ability = newAbility;
        return;
    }

    getPos() {
        return {x:this.x,y:this.y};
    }

    getUsername(){
        return this.username;
    }

}