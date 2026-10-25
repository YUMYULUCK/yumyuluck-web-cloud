(() => {
  const room=document.querySelector('.film-room');
  if(!room) return;
  const stage=room.querySelector('.film-stage');
  const buttons=[...room.querySelectorAll('[data-film-category]')];
  const panels=[...room.querySelectorAll('[data-film-panel]')];
  const status=room.querySelector('#machine-status');
  const announcer=room.querySelector('#film-announcer');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let selected=0, opened=null, gesture=null, suppressClick=false, paint=0;
  const wrap=n=>(n+buttons.length)%buttons.length;
  function arrange(fraction=0){
    const mobile=stage.clientWidth<650;
    const card=mobile?112:190;
    const radius=(stage.clientWidth-card*.95)/2/Math.sin(1.06);
    buttons.forEach((button,index)=>{
      let offset=wrap(index-selected+2)-2;
      const angle=(offset+fraction)*.53;
      const depth=Math.abs(offset+fraction);
      button.style.setProperty('--reel-x',`${radius*Math.sin(angle)}px`);
      button.style.setProperty('--reel-y',`${-(mobile?100:140)*(1-Math.cos(angle))}px`);
      button.style.setProperty('--reel-scale',String(1-depth*(mobile?.16:.10)));
      button.style.setProperty('--reel-z',String(Math.round(20-depth*5)));
      button.classList.toggle('is-selected',index===selected);
      button.setAttribute('aria-pressed',String(index===selected));
    });
    status.textContent=buttons[selected].dataset.filmName;
  }
  function closePanel(focus=false){
    const previous=opened;
    panels.forEach(panel=>{panel.hidden=true;panel.classList.remove('is-opening');});
    buttons.forEach(button=>button.setAttribute('aria-expanded','false'));
    opened=null;
    room.classList.remove('is-projecting');
    if(focus&&previous) previous.focus({preventScroll:true});
  }
  function select(index){
    const next=wrap(index);
    if(next!==selected) closePanel();
    selected=next;arrange();
    announcer.textContent=`已选择${buttons[selected].dataset.filmName}，点击胶片查看作品`;
  }
  function open(index){
    const button=buttons[index];
    if(opened===button){closePanel();return;}
    select(index);closePanel();opened=button;
    const panel=document.getElementById(button.getAttribute('aria-controls'));
    panel.hidden=false;panel.classList.add('is-opening');
    button.setAttribute('aria-expanded','true');room.classList.add('is-projecting');
    announcer.textContent=`${button.dataset.filmName}已展开，${panel.querySelectorAll('.film-frame').length}部作品`;
    requestAnimationFrame(()=>panel.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'nearest'}));
  }
  buttons.forEach((button,index)=>{
    button.addEventListener('click',()=>open(index));
    button.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=selected+1;
      else if(event.key==='ArrowLeft')next=selected-1;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=buttons.length-1;
      else return;
      event.preventDefault();select(next);buttons[selected].focus({preventScroll:true});
    });
  });
  room.querySelectorAll('[data-reel-step]').forEach(button=>button.addEventListener('click',()=>select(selected+Number(button.dataset.reelStep))));
  panels.forEach(panel=>panel.querySelector('.film-panel-close').addEventListener('click',()=>closePanel(true)));
  room.addEventListener('keydown',event=>{if(event.key==='Escape'&&opened){event.preventDefault();closePanel(true);}});
  stage.addEventListener('dragstart',event=>event.preventDefault());
  stage.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    suppressClick=false;gesture={id:event.pointerId,x:event.clientX,dx:0,dragging:false};
  });
  stage.addEventListener('pointermove',event=>{
    if(!gesture||gesture.id!==event.pointerId)return;
    gesture.dx=event.clientX-gesture.x;
    if(!gesture.dragging&&Math.abs(gesture.dx)>7){gesture.dragging=true;stage.setPointerCapture(event.pointerId);stage.classList.add('is-dragging');}
    if(gesture.dragging){
      event.preventDefault();
      if(!paint)paint=requestAnimationFrame(()=>{paint=0;if(gesture)arrange(Math.max(-.85,Math.min(.85,gesture.dx/180)));});
    }
  });
  function finish(event){
    if(!gesture||gesture.id!==event.pointerId)return;
    const current=gesture;gesture=null;
    if(paint){cancelAnimationFrame(paint);paint=0;}
    suppressClick=current.dragging;
    stage.classList.remove('is-dragging');
    if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
    if(current.dragging&&Math.abs(current.dx)>35)select(selected+(current.dx<0?1:-1));else arrange();
  }
  stage.addEventListener('pointerup',finish);
  stage.addEventListener('pointercancel',event=>{if(gesture)gesture.dx=0;finish(event);});
  stage.addEventListener('pointerleave',()=>{if(gesture&&!gesture.dragging)gesture=null;});
  stage.addEventListener('click',event=>{if(event.detail===0){suppressClick=false;return;}if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false;}},true);
  stage.addEventListener('lostpointercapture',()=>{gesture=null;stage.classList.remove('is-dragging');});
  new ResizeObserver(()=>arrange()).observe(stage);
  arrange();
})();
