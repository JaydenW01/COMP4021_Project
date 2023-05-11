import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Lobby from './Lobby.js';
import Gameboard from './Gameboard.js';
import Player from './Player.js';

const lobby = new Lobby();
let gameboard = null;
const player1 = new Player(1);
const player2 = new Player(2);

const app = express();
app.use(express.static('public'));
app.use(express.json());

const bombermanSession = session({
    secret : "grp28",
    resave : false,
    saveUninitialed : false,
    rolling : true,
    cookie: {maxAge: 99999999},
});
app.use(bombermanSession);

function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, displayName, password } = req.body;

    //
    // Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));
    //
    // Checking for the user data correctness
    // check empty field
    if (!username || !displayName || !password){
        res.json({ status: "error", error: "There is empty field!" });
        console.log(req.body)
        return;
    }
    // check username format
    if (!containWordCharsOnly(username)){
        res.json({ status: "error", error: "The username should only contains underscores, letters or numbers" });
        return;
    }
    // check if the username already exists
    if (username in users){
        res.json({ status: "error", error: "Username already exists" });
        return;
    }
    //
    // G. Adding the new user account
    //
    const hash = bcrypt.hashSync(password,10);
    users[username] = {displayName,password:hash};
    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("data/users.json",JSON.stringify(users,null," "));
    //
    // I. Sending a success response to the browser
    //
    res.json({status:"success"});

    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));
    //
    // E. Checking for username/password
    //
    if (!(username in users)){
        res.json({status:"error",error:"Incorrect username/password"});
        return;
    }
    const user = users[username];
    if (!bcrypt.compareSync(password,user.password)){
        res.json({status:"error",error:"Incorrect username/password"});
        return;
    }

    //generate user session
    req.session.user = {username:username,displayName:user.displayName};
    console.log(req.session);
    //
    // G. Sending a success response with the user account
    //
    res.json({status:"success", user:req.session.user});
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {
    //
    // B. Getting req.session.user
    //
    if (!req.session.user){
        res.json({status:"error",error:"You have not signed in!"});
        return;
    }
    //
    // D. Sending a success response with the user account
    //
    res.json({status:"success", user:req.session.user});
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {
    console.log(req.session)
    //
    // Deleting req.session.user
    //
    req.session.user = null;
    //
    // Sending a success response
    //
    res.json({status:"success"});
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

app.get("/ranking",(req,res)=>{
    const ranking = JSON.parse(fs.readFileSync("data/ranking.json"));
    ranking.sort((a, b) => b.points - a.points);
    res.json({status:"success",ranking:JSON.stringify(ranking)});
    //console.log(ranking)
})

app.post("/post_score",(req,res)=>{
    if (req.session.user){
        const {points} = req.body;
        const displayName = req.session.user.displayName;
        const ranking = JSON.parse(fs.readFileSync('data/ranking.json'));
        ranking.push({displayName,points});
        fs.writeFileSync('data/ranking.json', JSON.stringify(ranking, null, ' '));
        res.status(200).json({status:'success'});
    } else {
        res.status(404).json({status:'error',message:"Unauthorized user"});
    }
})




// WebSocket codes ...
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection",(socket)=>{
    // print out who has connected 
    console.log(`${socket.request.session.user?.username} has logged in`);

    socket.on('post-score',(obj)=>{
        const {displayName,points} = JSON.parse(obj);
        const ranking = JSON.parse(fs.readFileSync('data/ranking.json'));
        ranking.push({displayName,points});
        fs.writeFileSync('data/ranking.json', JSON.stringify(ranking, null, ' '));
    })

    // when player is ready to start the game, for CHARLIE: to join lobby: socket.emit("joinLobby","red");
    socket.on('joinLobby',(object)=>{
        const obj = JSON.parse(object);
        const {username,displayName,colour} = obj;
        socket.request.session['user'] = {username,displayName};
        console.log(socket.request.session);
        const result = lobby.addPlayer(socket.request.session.user?.username,socket.request.session.user?.displayName,colour)
        if (result.result === "successful"){
            const lobbyInfo = lobby.getLobbyInfo();
            if (lobbyInfo.players.length === 1){
                player1.setUser(socket.request.session.user?.username,colour,socket.request.session.user?.displayName);
            } else {
                player2.setUser(socket.request.session.user?.username,colour,socket.request.session.user?.displayName);
            }
            socket.emit('joinedLobby successfully',JSON.stringify(lobbyInfo)); // Frontend should listen to this event before allowing the user to join the lobby
            console.log(lobbyInfo)
            io.emit('update lobby',JSON.stringify(lobby.getLobbyInfo()));
        } else {
            console.log("failed to join lobby")
            socket.emit("failed to join lobby",result.message);
        }
    })
    
    socket.on("leaveLobby",(username)=>{
        console.log(`${username} has left the lobby`);
        lobby.removePlayer(username);
        io.emit("update lobby",JSON.stringify(lobby.getLobbyInfo()));
    })

    socket.on("setGameTime",(time)=>{ // time is in seconds, and can only increment by 30 seconds
        const result = lobby.setGameTime(time);
        if (result.result !== "successful"){
            socket.emit("failed",result.message);
        } else {
            io.emit("newGameTime",time);
        }
    })

    let autoupdate = null;
    socket.on("onReady",(playerNo)=>{
        const username = lobby.getLobbyInfo().players[playerNo-1].username;
        const result = lobby.onReady(username);
        if (result.result === "StartGame"){
            autoupdate = setInterval(()=>{
            io.emit("updateBoard",JSON.stringify({
                players:[player1.playerInfo(),player2.playerInfo()],
                breakables:gameboard.gameboardInfo().breakables,
                bombs: gameboard.gameboardInfo().bombs,
                hearts:gameboard.gameboardInfo().hearts,
                coins:gameboard.gameboardInfo().coins
            }))},300);
            gameboard = new Gameboard();
            io.emit("StartGame",JSON.stringify({players:[player1.playerInfo(),player2.playerInfo()],breakables:gameboard.gameboardInfo().breakables,bombs:gameboard.gameboardInfo().bombs,hearts:gameboard.gameboardInfo().hearts,fires:gameboard.gameboardInfo().fires}));
        } else if (result.result === "failed") {
            socket.emit("failed to ready",result.message);
        } else {
            io.emit("update lobby",JSON.stringify(lobby.getLobbyInfo()));
        }
    })

    socket.on("onCancelReady",(playerNo)=>{
        console.log("Hi")
        const username = lobby.getLobbyInfo().players[playerNo-1].username;
        console.log(username)
        const result = lobby.onCancelReady(username);
        if (result.result === "failed") {
            socket.emit("failed to ready",result.message);
        } else {
            io.emit("update lobby",JSON.stringify(lobby.getLobbyInfo()));
        }
    })

    // remove the user (when the player disconnect/logout)
    // socket.on("disconnect",(username)=>{
    //     const number = lobby.getPlayerNo(username);
    //     if (number === 1 && lobby.players.length == 2){
    //         player1.setUser(player2.getUsername(),player2.getColour(),player2.getDisplayName());
    //         player2.reset();
    //     }
    //     lobby.removePlayer(username);
    // })

    socket.on("post-game message",(content)=>{
        const {username,displayName} = socket.request.session.user;
        console.log(content);
        const message = {username,displayName,message:content};
        io.emit("new post-game message",JSON.stringify(message));
    })

    // in game sockets
    socket.on("moveUp",()=>{
        if (socket.request.session.user?.username === player1.getUsername()){
            if (gameboard.checkWalkable(player1.getPos(),"up")){ // can walk there
                player1.moveUp();
                if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "fire"){
                    player1.getAbility("fire");
                    gameboard.deleteItem()
                } else if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "heart"){
                    player1.increaseHealth(player1.getPos().x,player1.getPos().y);
                }
                player1.playerInfo();
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            } else {
                player1.faceUp();
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            }
        } else if (socket.request.session.user?.username === player2.getUsername()){
            if (gameboard.checkWalkable(player2.getPos(),"up")){ // can walk there
                player2.moveUp();
                if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "fire"){
                    player2.getAbility("fire");
                    gameboard.deleteItem()
                } else if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "heart"){
                    player2.increaseHealth(player2.getPos().x,player2.getPos().y);
                }
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            } else {
                player2.faceUp();
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            }
        }
    })

    socket.on("moveDown",()=>{
        if (socket.request.session.user?.username === player1.getUsername()){
            if (gameboard.checkWalkable(player1.getPos(),"down")){ // can walk there
                player1.moveDown();
                if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "fire"){
                    player1.getAbility("fire");
                    gameboard.deleteItem()
                } else if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "heart"){
                    player1.increaseHealth(player1.getPos().x,player1.getPos().y);
                }
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            } else {
                player1.faceDown();
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            }
        } else if (socket.request.session.user?.username === player2.getUsername()){
            if (gameboard.checkWalkable(player2.getPos(),"down")){ // can walk there
                player2.moveDown();
                if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "fire"){
                    player2.getAbility("fire");
                    gameboard.deleteItem()
                } else if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "heart"){
                    player2.increaseHealth(player2.getPos().x,player2.getPos().y);
                }
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            } else {
                player2.faceDown();
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            }
        }
    })

    socket.on("moveLeft",()=>{
        if (socket.request.session.user?.username === player1.getUsername()){
            if (gameboard.checkWalkable(player1.getPos(),"left")){ // can walk there
                player1.moveLeft();
                if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "fire"){
                    player1.getAbility("fire");
                    gameboard.deleteItem()
                } else if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "heart"){
                    player1.increaseHealth(player1.getPos().x,player1.getPos().y);
                }
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            } else {
                player1.faceLeft();
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            }
        } else if (socket.request.session.user?.username === player2.getUsername()){
            if (gameboard.checkWalkable(player2.getPos(),"left")){ // can walk there
                player2.moveLeft();
                if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "fire"){
                    player2.getAbility("fire");
                    gameboard.deleteItem()
                } else if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "heart"){
                    player2.increaseHealth(player2.getPos().x,player2.getPos().y);
                }
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            } else {
                player2.faceLeft();
                io.emit("updateBoard",JSON.stringify({
                    players:[player1.playerInfo(),player2.playerInfo()],
                    breakables:gameboard.gameboardInfo().breakables,
                    bombs: gameboard.gameboardInfo().bombs,
                    hearts:gameboard.gameboardInfo().hearts,
                    coins:gameboard.gameboardInfo().coins
                }))
            }
        }
    })

    socket.on("moveRight",()=>{
        if (socket.request.session.user?.username === player1.getUsername()){
            if (gameboard.checkWalkable(player1.getPos(),"right")){ // can walk there
                player1.moveRight();
                if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "fire"){
                    player1.getAbility("fire");
                    gameboard.deleteItem()
                } else if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "heart"){
                    player1.increaseHealth(player1.getPos().x,player1.getPos().y);
                }
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            } else {
                player1.faceRight();
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            }
        } else if (socket.request.session.user?.username === player2.getUsername()){
            if (gameboard.checkWalkable(player2.getPos(),"right")){ // can walk there
                player2.moveRight();
                if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "fire"){
                    player2.getAbility("fire");
                    gameboard.deleteItem()
                } else if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "heart"){
                    player2.increaseHealth(player2.getPos().x,player2.getPos().y);
                }
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            } else {
                player2.faceRight();
                // io.emit("updateBoard",JSON.stringify({
                //     players:[player1.playerInfo(),player2.playerInfo()],
                //     breakables:gameboard.gameboardInfo().breakables,
                //     bombs: gameboard.gameboardInfo().bombs,
                //     hearts:gameboard.gameboardInfo().hearts,
                //     coins:gameboard.gameboardInfo().coins
                // }))
            }
        }
    })

    let player1Bomb = 0;
    let player2Bomb = 0;
    let timesup = 1;

    const explode = (playerNo)=>{
        const explosion = gameboard.setOffBomb(playerNo);
        const player1AfterExplosion = player1.checkExplosion(explosion);
        const player2AfterExplosion = player2.checkExplosion(explosion);
        if (playerNo === 1){
            player1.addPoints(explosion.points);
            player1Bomb -=1;
        } else if (playerNo === 2){
            player2.addPoints(explosion.points);
            player2Bomb -=1
        }
        io.emit("explode",playerNo);
        // io.emit("updateBoard",JSON.stringify({
        //     players:[player1.playerInfo(),player2.playerInfo()],
        //     breakables:gameboard.gameboardInfo().breakables,
        //     bombs: gameboard.gameboardInfo().bombs,
        //     hearts:gameboard.gameboardInfo().hearts,
        //     coins:gameboard.gameboardInfo().coins
        // }))
        if (!player1AfterExplosion){ // does not survive after explosion
            clearInterval(autoupdate);
            io.emit("GameOver",JSON.stringify({message:"Player1 died!",player1Points:player1.getPoints(),player2Points:player2.getPoints(),player1Name:player1.getDisplayName(),player2Name:player2.getDisplayName()}));
            const ranking = JSON.parse(fs.readFileSync('data/ranking.json'));
            if (player1.getDisplayName() && player2.getDisplayName()){
                ranking.push({displayName:player1.getDisplayName(),points:player1.getPoints()});
                ranking.push({displayName:player2.getDisplayName(),points:player2.getPoints()});
            }
            fs.writeFileSync('data/ranking.json', JSON.stringify(ranking, null, ' '));
            autoupdate = null;
            return;
        }
        if (!player2AfterExplosion){ // does not survive after explosion
            clearInterval(autoupdate);
            io.emit("GameOver",JSON.stringify({message:"Player2 died!",player1Points:player1.getPoints(),player2Points:player2.getPoints(),player1Name:player1.getDisplayName(),player2Name:player2.getDisplayName()}));
            const ranking = JSON.parse(fs.readFileSync('data/ranking.json'));
            if (player1.getDisplayName() && player2.getDisplayName()){
                ranking.push({displayName:player1.getDisplayName(),points:player1.getPoints()});
                ranking.push({displayName:player2.getDisplayName(),points:player2.getPoints()});
            }
            fs.writeFileSync('data/ranking.json', JSON.stringify(ranking, null, ' '));
            autoupdate = null;
            return;
        }
    }

    

    socket.on("placeBomb",()=>{
        if (socket.request.session.user?.username === player1.getUsername()){ // find out who press spacebar
            if (player1Bomb === 0){
                gameboard.placeBomb(player1.getPos(),1,1);
                player1Bomb += 1;
            } else if (player1Bomb === 1){
                explode(1,1);
            }
            // let bombID = 1;
        } else if (socket.request.session.user?.username === player2.getUsername()){ // find out who press spacebar
            // let bombID = 2;
            if (player2Bomb === 0){
                gameboard.placeBomb(player2.getPos(),2,2);
                player2Bomb += 1;
            } else if (player2Bomb === 1){
                explode(2,2);
            }
        }
        // io.emit("updateBoard",JSON.stringify({
        //     players:[player1.playerInfo(),player2.playerInfo()],
        //     breakables:gameboard.gameboardInfo().breakables,
        //     bombs: gameboard.gameboardInfo().bombs,
        //     hearts:gameboard.gameboardInfo().hearts,
        //     coins:gameboard.gameboardInfo().coins
        // }))
    })

    socket.on("Time's Up",()=>{
        timesup -= 1;
        if (timesup === 0){
            clearInterval(autoupdate);
            io.emit("GameOver",JSON.stringify({message:"Time's up!",player1Points:player1.getPoints(),player2Points:player2.getPoints(),player1Name:player1.getDisplayName(),player2Name:player2.getDisplayName()}));
            const ranking = JSON.parse(fs.readFileSync('data/ranking.json'));
            if (player1.getDisplayName() && player2.getDisplayName()){
                ranking.push({displayName:player1.getDisplayName(),points:player1.getPoints()});
                ranking.push({displayName:player2.getDisplayName(),points:player2.getPoints()});
            }
            fs.writeFileSync('data/ranking.json', JSON.stringify(ranking, null, ' '));
            autoupdate = null;
        }
    })

    socket.on("reset",()=>{
        timesup = 1;
        player1.reset();
        player2.reset();
        lobby.reset();
        gameboard = null;
    })

    socket.on("debug",()=>{
        console.log(socket.request.session.user);
    })


})

io.use((socket, next) => {
    bombermanSession(socket.request, {}, next);
});

httpServer.listen(8000, () => {
    console.log("The server has started at localhost 8000...");
});