export default class Lobby {
    constructor() {
        this.players = [];
        this.gameTime = 180; // in seconds
    }

    // player ={ 
    //     username: "XXX",
    //     displayName: "XXX",
    //     colour: "XXX",
    //     ready: true/false
    // }
    reset() {
        this.players = [];
        this.gameTime = 180; 
    }

    addPlayer(username,displayName,colour){
        // check if the player is already in the lobby
        for (const player of this.players){
            if (player.username === username){ // if the player is in the lobby, return
                return {result: "failed",message:"The player is already in the lobby"};
            }
        }
        // check if there are more than 2 players in the lobby
        if (this.players.length >= 2){
            return {result: "failed",message:"The lobby is full"};
        }
        // check if the colour is correctly input
        if (!['yellow','black','red','blue'].includes(colour)){
            return {result: "failed",message:"Wrong colour input"};
        }
        // No problem: Can add the player in
        this.players.push({username,displayName,colour,ready:false});
        return {result: "successful"};
    }

    getPlayerNo(username){
        if (players[0].username === username){
            return 1;
        }
        if (this.players.length === 2){
            if (players[1].username === username){
                return 2;
            }
        }
        return;
    }

    removePlayer(username){
        // check if the player is in the lobby
        for (const player of this.players){
            if (player.username === username){ // found
                this.players = this.players.filter(obj => obj.username !== username);
                return {result: "successful"};
            }
        } 
        return {result: "failed",message:"The player is not in the lobby"}; // not in the lobby
    }

    setGameTime(time){
        if (time < 30){
            return {result: "failed",message:"The game period is too short"};
        } else if (time % 30 !== 0) {
            return {result: "failed",message:"The game period can only be increment of 30 seconds"};
        } else {
            this.gameTime = time;
            return {result: "successful"};
        }
    }

    getLobbyInfo(){
        return {players:this.players,gameTime:this.gameTime}
    }

    startGame(){
        this.players = [];
        this.gameTime = 180;
    }

    checkBothReady(){
        if (this.players.length !== 2){
            return false;
        } else {
            if (this.players[0].ready && this.players[1].ready){
                return true
            } else {
                return false;
            }
        }
    }

    onReady(username){
        // check if the player is already in the lobby
        for (let i = 0;i < this.players.length;i++){
            if (this.players[i].username === username){ // if the player is in the lobby, return
                this.players[i].ready = true;
                if (this.checkBothReady()){
                    return {result:"StartGame",players:[this.players[0].username,this.players[1].username]};
                } else {
                    return {result:"successful"};
                }
            }
        } 
        return {result:"failed","message":"User not found"};
    }

    onCancelReady(username){
        for (let i = 0;i < this.players.length;i++){
            if (this.players[i].username === username){ // if the player is in the lobby, return
                this.players[i].ready = false;
                return {result:"successful"};
            }
        } 
        return {result:"failed","message":"User not found"};
    }
}