export default class Player {
    constructor(colour,playerNo) {
        this.colour = colour;
        this.playerNo = playerNo;
        this.x = playerNo == 0 ? 0 : 20;
        this.y = playerNo == 0 ? 0 : 20;
        this.health = 3;
        this.cheat = 3;
        this.ability = false;
    }
    
    // the following function checks if the move is legal and return true/false, if true: update the coordinates
    moveUp = ()=>{ //TODO
        
    }

    moveDown = ()=>{ //TODO

    }

    moveLeft = ()=>{ //TODO
        
    }

    moveRight = ()=>{ //TODO
        
    }

    reduceHealth = ()=>{
        if (this.health-1 == 0){
            return false;
        } else {
            this.health -= 1;
            return true;
        }
    }

    increaseHealth = ()=>{
        if (this.health==3){
            return
        } else {
            this.health += 1;
        }
    }

    playerInfo = ()=>{
        return {x:this.x,y:this.y,colour:this.colour,health:this.health,ability:this.ability,cheat:this.cheat};
    }

    getAbility = (newAbility)=>{
        this.ability = newAbility;
        return;
    }
    
}