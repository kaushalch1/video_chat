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

io.on("connection",(socket)=>{
    
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
