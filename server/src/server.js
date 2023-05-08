const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const fs = require("fs");

const Lobby = require("./Lobby");
const app = express();
app.use(express.static('public'));
app.use(express.json());

const bombermanSession = session({
    secret : "grp28",
    resave : false,
    saveUninitialed : false,
    rolling : true,
    cookie: {maxAge: 99999999}
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
    req.session.user = {username,displayName:user.displayName};
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

    //
    // Deleting req.session.user
    //
    if (req.session.user){
        delete req.session.user;
    }
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
    res.json(JSON.stringify(ranking));
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
const {createServer} = require("http");
const {Server} = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);


io.use((socket,next)=>{
    bombermanSession(socket.request,{},next);
});

io.on("connection",(socket)=>{
    // print out who has connected 
    console.log(`${socket.request.session.user?.username} has logged in`);

    // when player is ready to start the game, for CHARLIE: to join lobby: socket.emit("joinLobby","red");
    socket.on('joinLobby',(colour)=>{
        const result = Lobby.addPlayer(socket.request.session.user?.username,socket.request.session.user?.displayName,colour)
        if (result.result === "successful"){
            const lobbyInfo = Lobby.getLobbyInfo();
            socket.emit('joinedLobby successfully',JSON.stringify(lobbyInfo)); // Frontend should listen to this event before allowing the user to join the lobby
            io.emit('newPlayer',{username:socket.request.session.user?.username,displayName:socket.request.session.user?.displayName,colour});
        } else {
            socket.emit("failed to join lobby",result.message);
        }
    })

    socket.on("leaveLobby",(username)=>{
        Lobby.removePlayer(username);
        io.emit("playerLeft",username);
    })

    socket.on("setGameTime",(time)=>{ // time is in seconds, and can only increment by 30 seconds
        const result = Lobby.setGameTime(time);
        if (result.result !== "successful"){
            socket.emit("failed",result.message);
        } else {
            io.emit("newGameTime",time);
        }
    })

    socket.on("onReady",(username)=>{
        const result = Lobby.onReady(username);
        if (result.result === "StartGame"){
            io.emit("StartGame",JSON.stringify(result.players));
        } else if (result.result === "failed") {
            socket.emit("failed to ready",result.message);
        } else {
            io.emit("playerIsReady",username);
        }
    })

    // socket.on("changeColour",(newColour)=>{
    //     const result = Lobby.changeColour(socket.request.session.user?.username,newColour);
    // })

    // remove the user (when the player disconnect/logout)
    socket.on("disconnect",()=>{
        Lobby.removePlayer(username);
    })

    socket.on("post-game message",(content)=>{
        const {username,displayName} = socket.request.session.user;
        const message = {username,displayName,message:content};
        io.emit("new post-game message",JSON.stringify(message));
    })

})


httpServer.listen(8000, () => {
    console.log("The server has started at localhost 8000...");
});