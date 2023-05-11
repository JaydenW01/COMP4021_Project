import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Lobby from './Lobby.js';
import Gameboard from './Gameboard.js';
import Player from './Player.js';
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


const lobby = new Lobby();
let gameboard = new Gameboard(initialWalls,initialBreakables);
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
let timesup = 1;

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
                if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "coin"){
                    player1.addPoints(10);
                    gameboard.deleteItem(player1.getPos().x,player1.getPos().y)
                } else if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "heart"){
                    player1.increaseHealth(player1.getPos().x,player1.getPos().y);
                    gameboard.deleteItem(player1.getPos().x,player1.getPos().y)
                }
                player1.playerInfo();
            } else {
                player1.faceUp();
            }
        } else if (socket.request.session.user?.username === player2.getUsername()){
            if (gameboard.checkWalkable(player2.getPos(),"up")){ // can walk there
                player2.moveUp();
                if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "coin"){
                    player2.addPoints(10);
                    gameboard.deleteItem(player2.getPos().x,player2.getPos().y);
                } else if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "heart"){
                    player2.increaseHealth(player2.getPos().x,player2.getPos().y);
                    gameboard.deleteItem(player2.getPos().x,player2.getPos().y);
                }
            } else {
                player2.faceUp();
            }
        }
    })

    socket.on("moveDown",()=>{
        if (socket.request.session.user?.username === player1.getUsername()){
            if (gameboard.checkWalkable(player1.getPos(),"down")){ // can walk there
                player1.moveDown();
                if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "coin"){
                    player1.addPoints(10);
                    gameboard.deleteItem(player1.getPos().x,player1.getPos().y)
                } else if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "heart"){
                    player1.increaseHealth(player1.getPos().x,player1.getPos().y);
                    gameboard.deleteItem(player1.getPos().x,player1.getPos().y)
                }
                player1.playerInfo();
            } else {
                player1.faceDown();
            }
        } else if (socket.request.session.user?.username === player2.getUsername()){
            if (gameboard.checkWalkable(player2.getPos(),"down")){ // can walk there
                player2.moveDown();
                if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "coin"){
                    player2.addPoints(10);
                    gameboard.deleteItem(player2.getPos().x,player2.getPos().y);
                } else if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "heart"){
                    player2.increaseHealth(player2.getPos().x,player2.getPos().y);
                    gameboard.deleteItem(player2.getPos().x,player2.getPos().y);
                }
            } else {
                player2.faceDown();
            }
        }
    })

    socket.on("moveLeft",()=>{
        if (socket.request.session.user?.username === player1.getUsername()){
            if (gameboard.checkWalkable(player1.getPos(),"left")){ // can walk there
                player1.moveLeft();
                if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "coin"){
                    player1.addPoints(10);
                    gameboard.deleteItem(player1.getPos().x,player1.getPos().y)
                } else if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "heart"){
                    player1.increaseHealth(player1.getPos().x,player1.getPos().y);
                    gameboard.deleteItem(player1.getPos().x,player1.getPos().y)
                }
                player1.playerInfo();
            } else {
                player1.faceLeft();
            }
        } else if (socket.request.session.user?.username === player2.getUsername()){
            if (gameboard.checkWalkable(player2.getPos(),"left")){ // can walk there
                player2.moveLeft();
                if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "coin"){
                    player2.addPoints(10);
                    gameboard.deleteItem(player2.getPos().x,player2.getPos().y);
                } else if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "heart"){
                    player2.increaseHealth(player2.getPos().x,player2.getPos().y);
                    gameboard.deleteItem(player2.getPos().x,player2.getPos().y);
                }
            } else {
                player2.faceLeft();
            }
        }
    })

    socket.on("moveRight",()=>{
        if (socket.request.session.user?.username === player1.getUsername()){
            if (gameboard.checkWalkable(player1.getPos(),"right")){ // can walk there
                player1.moveRight();
                if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "coin"){
                    player1.addPoints(10);
                    gameboard.deleteItem(player1.getPos().x,player1.getPos().y)
                } else if (gameboard.findBlockByPos(player1.getPos().x,player1.getPos().y) === "heart"){
                    player1.increaseHealth(player1.getPos().x,player1.getPos().y);
                    gameboard.deleteItem(player1.getPos().x,player1.getPos().y)
                }
                player1.playerInfo();
            } else {
                player1.faceRight();
            }
        } else if (socket.request.session.user?.username === player2.getUsername()){
            if (gameboard.checkWalkable(player2.getPos(),"right")){ // can walk there
                player2.moveRight();
                if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "coin"){
                    player2.addPoints(10);
                    gameboard.deleteItem(player2.getPos().x,player2.getPos().y);
                } else if (gameboard.findBlockByPos(player2.getPos().x,player2.getPos().y) === "heart"){
                    player2.increaseHealth(player2.getPos().x,player2.getPos().y);
                    gameboard.deleteItem(player2.getPos().x,player2.getPos().y);
                }
            } else {
                player2.faceRight();
            }
        }
    })

    let player1Bomb = 0;
    let player2Bomb = 0;
    

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
            gameboard.setBreakables(initialBreakables);
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
            gameboard.setBreakables(initialBreakables);
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
        gameboard.setBreakables(initialBreakables);
        timesup -= 1;
        if (timesup === 0){
            timesup = 1;
            console.log("time's up")
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
        player1.reset();
        player2.reset();
        lobby.reset();
        gameboard.reset(initialWalls,initialBreakables);
    })

    socket.on("stopRender",()=>{
        clearInterval(autoupdate);
    })



})

io.use((socket, next) => {
    bombermanSession(socket.request, {}, next);
});

httpServer.listen(8000, () => {
    console.log("The server has started at localhost 8000...");
});