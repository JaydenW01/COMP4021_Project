const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const fs = require("fs");

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
    req.session.user = {username,avatar:user.avatar,name:user.name};
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





// WebSocket codes ...
const {createServer} = require("http");
const {Server} = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);

io.use((socket,next)=>{
    bombermanSession(socket.request,{},next);
});
// Online User list
const inLobby = {};
io.on("connection",(socket)=>{
    // print out who has connected 
    console.log(socket.request.session.user?.username);

    // when player is ready to start the game
    socket.on('joinLobby',()=>{
        io.emit('someoneJoinedLobby',JSON.stringify({name:socket.request.session.user?.name}));
    })

    if (socket.request.session.user){ 
        const {username,avatar,name} = socket.request.session.user;
        onlineUsers[username] = {avatar,name};
        io.emit("add user",JSON.stringify({username,avatar,name}));
    }

    // remove the user (when the player disconnect/logout)
    socket.on("disconnect",()=>{
        if (socket.request.session.user){
            const {username,name} = socket.request.session.user;
            delete inLobby[username];
            io.emit("remove user",JSON.stringify({username,name}));
        }
    })

})


httpServer.listen(8000, () => {
    console.log("The chat server has started at localhost 8000...");
});