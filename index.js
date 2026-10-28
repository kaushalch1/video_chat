let btn1=document.getElementById("btn1");
let btn2=document.getElementById("btn2");
let video=document.querySelector("video");

let audioactive = false;
let videoactive = false;

let currentstream = null;
let audiotrack =null;
let videotrack= null;

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
        audiotrack=null;
    }
    if(videotrack&&!videoactive){
        videotrack.stop();
        videotrack=null;
        video.srcObject=null;
    }
    if(!audioactive&&!videoactive){
        currentstream=null;
        return;
    }
    const constraints ={audio: audioactive,video: videoactive};
    try{
        const stream =await navigator.mediaDevices.getUserMedia(constraints);
        currentstream =stream;
        if(audioactive){
            audiotrack=stream.getAudioTracks()[0];
        }
        if(videoactive){
            videotrack=stream.getVideoTracks()[0];
            video.srcObject=stream;
            video.play();
        }
    }catch(error){
        console.log("Error accessing hardware");
    }
}