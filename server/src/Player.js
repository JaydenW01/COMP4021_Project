const Player = (colour,playerNo) => {
    let x = playerNo == 0 ? 0 : 20;
    let y = playerNo == 0 ? 0 : 20;
    let health = 3;
    let cheat = false;
    let ability = false;
    
    // the following function checks if the move is legal and return true/false, if true: update the coordinates
    const moveUp = ()=>{ //TODO
        
    }

    const moveDown = ()=>{ //TODO

    }

    const moveLeft = ()=>{ //TODO
        
    }

    const moveRight = ()=>{ //TODO
        
    }

    const reduceHealth = ()=>{
        if (health-1 == 0){
            return false;
        } else {
            health -= 1;
            return true;
        }
    }

    const increaseHealth = ()=>{
        if (health==3){
            return
        } else {
            health += 1;
        }
    }

    const playerInfo = ()=>{
        return {x,y,colour,health,ability,cheat};
    }

    const getAbility = (newAbility)=>{
        ability = newAbility;
        return;
    }

    return {
        moveUp:moveUp,
        moveLeft:moveLeft,
        moveRight:moveRight,
        moveDown:moveDown,
        reduceHealth:reduceHealth,
        increaseHealth:increaseHealth,
        playerInfo:playerInfo,
        getAbility:getAbility
    }

}