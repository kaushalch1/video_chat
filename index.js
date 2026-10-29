let btn1=document.getElementById("btn1");
let btn2=document.getElementById("btn2");
let video=document.querySelector("video");
const videoGrid = document.getElementById("video-grid")||document.body;
const socket=io("/");

const mypeer=new Peer(undefined,{
    host: '/',
    port: '9000',
    path: '/'
})

let audioactive = false;
let videoactive = false;

let currentstream = new MediaStream();
let audiotrack =null;
let videotrack= null;

mypeer.on('open',id=>{
    socket.emit('join room',Room_id,id);
});

const calls={};
mypeer.on('call',call=>{
    call.answer(currentstream);
    const remotevideo=document.createElement('video');
    remotevideo.autoplay =true;
    remotevideo.playsInline=true;
    
    call.on("stream",uservideostream=>{
        addVideoStream(remotevideo,uservideostream);
    });

    call.on("close", () => {
        remotevideo.remove();
    });

    calls[call.peer] = call;
});

socket.on("user connected",userid=>{
    setTimeout(()=>connectnewuser(userid, currentstream), 1000);
});

socket.on("user disconected",userid=>{
    if(calls[userid]){
        calls[userid].close();
        delete calls[userid];
    }
});

function connectnewuser(userid,stream){
    const call=mypeer.call(userid,stream);
    const remotevideo=document.createElement("video");
    remotevideo.autoplay = true;
    remotevideo.playsInline = true;

    call.on("stream",uservideo=>{
        addVideoStream(remotevideo,uservideo);
    });
    call.on("close",()=>{
        remotevideo.remove();
    });
    calls[userid]=call;
}

function addVideoStream(videoele,stream) {
  videoele.srcObject =stream;
  if (!videoGrid.contains(videoele)) {
    videoGrid.append(videoele);
  }
}

btn1.addEventListener("click",async ()=>{
    audioactive = !audioactive;
    if(audioactive){
        btn1.textContent ="Mic: ON"
    }else{
        btn1.textContent="Mic: OFF";
    }
    await hardware();
});
btn2.addEventListener("click",async ()=>{
    videoactive = !videoactive;
    if(videoactive){
        btn2.textContent="Video: ON";
    }else{
        btn2.textContent="Video: OFF";
    }
    await hardware();
});
async function hardware(){
    if(audiotrack&&!audioactive){
        audiotrack.stop();
        currentstream.removeTrack(audiotrack);
        replacetrack("audio",null);
        audiotrack=null;
    }
    if(videotrack&&!videoactive){
        videotrack.stop();
        currentstream.removeTrack(videotrack);
        replacetrack("video",null);
        videotrack=null;
        video.srcObject=null;
    }
    if(!audioactive&&!videoactive){
        //currentstream=null;
        return;
    }
    const constraints ={audio: audioactive,video: videoactive};
    try{
        const stream =await navigator.mediaDevices.getUserMedia(constraints);
        //currentstream =stream;
        if(audioactive){
            audiotrack=stream.getAudioTracks()[0];
            currentstream.addTrack(audiotrack);
            replacetrack("audio",audiotrack);
        }
        if(videoactive){
            videotrack=stream.getVideoTracks()[0];
            currentstream.addTrack(videotrack);
            replacetrack("video",videotrack);
            video.srcObject=stream;
            video.play();
        }
    }catch(error){
        console.log("Error accessing hardware");
    }
}

function replacetrack(kind, newtrack){
    Object.values(calls).forEach(call => {
        const senders= call.peerConnection.getSenders();
        const sender=senders.find(s => s.track&& s.track.kind===kind);
        if(sender){
            sender.replaceTrack(newtrack);
        }else if(newtrack){
            call.peerConnection.addTrack(newtrack,currentstream);
        }
    });
}
