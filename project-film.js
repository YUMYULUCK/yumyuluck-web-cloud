(() => {
  const video=document.querySelector('.project-screen video[data-stream]');
  const button=document.querySelector('.dunhuang-play');
  const error=document.querySelector('.film-error');
  if(!video || !button)return;
  const stream=video.dataset.stream;
  let hls=null,starting=false;
  const failed=()=>{if(error)error.hidden=false;button.hidden=true;};
  if(video.canPlayType('application/vnd.apple.mpegurl')){
    video.src=stream;
  }else if(window.Hls && Hls.isSupported()){
    hls=new Hls({maxBufferLength:20,maxMaxBufferLength:40,enableWorker:true});
    hls.loadSource(stream);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR,(_event,data)=>{
      if(data.fatal){
        if(data.type===Hls.ErrorTypes.MEDIA_ERROR)hls.recoverMediaError();
        else failed();
      }
    });
  }else{failed();return;}
  button.hidden=false;
  button.addEventListener('click',async()=>{
    if(starting)return;
    starting=true;
    try{await video.play();button.hidden=true;video.focus({preventScroll:true});}
    catch{button.hidden=false;button.querySelector('.dunhuang-play-text').textContent='重新播放';}
    finally{starting=false;}
  });
  video.addEventListener('play',()=>{button.hidden=true;if(error)error.hidden=true;});
  video.addEventListener('ended',()=>{button.querySelector('.dunhuang-play-text').textContent='再看一遍';button.hidden=false;});
  video.addEventListener('error',failed);
  window.addEventListener('pagehide',()=>{video.pause();if(hls)hls.stopLoad();});
  window.addEventListener('pageshow',event=>{if(event.persisted && hls)hls.startLoad();});
})();
