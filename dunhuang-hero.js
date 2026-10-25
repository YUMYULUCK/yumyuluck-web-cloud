(() => {
  const video=document.querySelector('.project-dunhuang .project-screen video');
  const button=document.querySelector('.dunhuang-play');
  if(!video||!button)return;
  button.hidden=false;
  let starting=false;
  button.addEventListener('click',async()=>{
    if(starting)return;
    starting=true;
    try{
      await video.play();
      button.hidden=true;
      video.focus({preventScroll:true});
    }catch{
      button.hidden=false;
      button.querySelector('.dunhuang-play-text').textContent='重新播放';
    }finally{starting=false;}
  });
  video.addEventListener('play',()=>{button.hidden=true;});
  video.addEventListener('ended',()=>{
    button.querySelector('.dunhuang-play-text').textContent='再看一遍';
    button.hidden=false;
  });
})();
