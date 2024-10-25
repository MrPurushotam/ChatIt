const interval = 5000;
let prevState= navigator.onLine;

const checkBroswerOnlineStatus=()=>{
    const currentState = navigator.onLine;
    if(prevState !== currentState){
        postMessage({online:currentState})
        prevState=currentState
    }
}

checkBroswerOnlineStatus();

setInterval(checkBroswerOnlineStatus,interval)