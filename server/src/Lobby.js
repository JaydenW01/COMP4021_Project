const Lobby = function() {
    let players = [];
    let gameTime = 180; // in seconds, default 180 seconds/3 min
    // player ={ 
    //     username: "XXX",
    //     displayName: "XXX",
    //     colour: "XXX"
    // }

    const addPlayer = (username,displayName,colour) => {
        // check if the player is already in the lobby
        for (const player of players){
            if (player.username === username){ // if the player is in the lobby, return
                return {result: "failed",message:"The player is already in the lobby"};
            }
        }
        // check if there are more than 2 players in the lobby
        if (players.length >= 2){
            return {result: "failed",message:"The lobby is full"};
        }
        // check if the colour is correctly input
        if (!['white','black','red','blue'].includes(colour)){
            return {result: "failed",message:"Wrong colour input"};
        }
        // No problem: Can add the player in
        players.push({username,displayName,colour});
        return {result: "successful"};
    }

    const removePlayer = (username) => {
        // check if the player is already in the lobby
        for (const player of players){
            if (player.username === username){ // if the player is in the lobby, return
                return {result: "failed",message:"The player is not in the lobby"};
            }
        } 
        players = players.filter(obj => obj.username !== username);
        return {result: "successful"};
    }

    const setGameTime = (time) => {
        if (time < 30){
            return {result: "failed",message:"The game period is too short"};
        } else if (time % 30 !== 0) {
            return {result: "failed",message:"The game period can only be increment of 30 seconds"};
        } else {
            gameTime = time;
            return {result: "successful"};
        }
    }

    const getLobbyInfo = () => {
        return {players,gameTime}
    }

    const startGame = () => {
        players = [];
        gameTime = 180;
    }

    const changeColour = (username,newColour) => {
        if (!['white','black','red','blue'].includes(newColour)){
            return {result: "failed",message:"Wrong colour input"};
        }
        // check if the player is in the lobby
        for (let i = 0;i < 2;i++){
            if (players[i].username === username){ // if the player is in the lobby, change his colour
                players[i].colour = newColour;
                return {result: "successful"};
            }
        }
        return {result:"failed",message:"Does not exist this username in the lobby"}
    }

    return {
        addPlayer:addPlayer,
        removePlayer:removePlayer,
        setGameTime:setGameTime,
        getLobbyInfo:getLobbyInfo,
        startGame:startGame,
        changeColour:changeColour
    };
};