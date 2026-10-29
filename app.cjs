const express=require("express");
const http=require("http");
const fs=require("fs");
const path=require("path");
const {Server} =require("socket.io");


let app=express();
let server=http.createServer(app);
const io=new Server(server);
const rootDir=__dirname;
const distDir=path.join(rootDir,"dist");


const roomsHistory = {},rooms={};
io.on("connection",(socket)=>{
    let currentRoom=null;
    let currentuser=null;
    console.log("Connected",socket.id);
    socket.on('join room',(room_name,userid)=>{
        if(currentRoom){
            socket.leave(currentRoom);
        }
        socket.join(room_name);
        currentRoom=room_name;
        currentuser=userid;
        if(!roomsHistory[room_name]){
            roomsHistory[room_name]=[];
            rooms[room_name]=[];
        }
        rooms[room_name].push(socket.id);
        socket.to(room_name).emit('user connected', userid);
        console.log(`User ${socket.id} joined room: ${room_name}`);
    })
    socket.on('disconnect',()=>{
        if(currentRoom&&currentuser){
            socket.to(room_name).emit('user disconnected',currentuser);
            console.log(`User ${socket.id} left room: ${room_name}`);
        }
    });
    // socket.on('video send',(video)=>{
    //     console.log('video:'+video);
    // })
});

if(fs.existsSync(distDir)) {
    app.use(express.static(distDir));
}

app.use(express.static(rootDir));
app.use((req,res)=>{
    const indexFile=fs.existsSync(distDir)
        ? path.join(distDir,"index.html")
        : path.join(rootDir, "index.html");
    res.sendFile(indexFile);
});

const PORT=process.env.PORT||9000;
server.listen(PORT, ()=> console.log(`Server is running on Port: ${PORT}`));
