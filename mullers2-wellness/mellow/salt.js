(() => {
  'use strict';
  const feature = document.querySelector('.salt-feature');
  const stage = document.querySelector('.salt-experience');
  const image = document.querySelector('#salt-device');
  const copy = document.querySelector('.salt-cloud-copy');
  const canvas = document.querySelector('#salt-air');
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, played = false, animation = 0, time = 0, previous = 0, width = 1, height = 1;
  const duration = 5;
  const clamp = n => Math.min(1,Math.max(0,n));
  const lowMotion = () => reduced.matches || !document.body.classList.contains('motion');
  const particles = Array.from({length:120},(_,i)=>({phase:(i*47%127)/127,spread:Math.sin(i*23.7),size:.65+i%4*.28}));
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0,0,width,height);
    const p = lowMotion() ? 1 : clamp(time/duration);
    const mobile = width < 650;
    const box = stage.getBoundingClientRect(), device = image.getBoundingClientRect(), text = copy.getBoundingClientRect();
    // The transparent poster is 3:4; account for object-fit's letterboxing.
    const scale = Math.min(device.width/720,device.height/960);
    const sx = device.left-box.left+(device.width-720*scale)/2+365*scale;
    const sy = device.top-box.top+(device.height-960*scale)/2+270*scale;
    const tx = text.left-box.left+text.width*.5, ty = text.top-box.top+text.height*.45;
    const cloud = clamp((p-.1)/.75);
    for(let i=0;i<14;i++) {
      const angle=i*2.39996, radius=(mobile?width*.3:width*.18)*(0.45+(i%4)*.18);
      const x=tx+Math.cos(angle)*radius, y=ty+Math.sin(angle)*radius*.65;
      const r=(mobile?width*.34:width*.19)*(.7+cloud*.3);
      const gradient=ctx.createRadialGradient(x,y,0,x,y,r);
      gradient.addColorStop(0,`rgba(255,251,241,${cloud*.22})`);gradient.addColorStop(1,'rgba(255,251,241,0)');
      ctx.fillStyle=gradient;ctx.fillRect(x-r,y-r,2*r,2*r);
    }
    particles.forEach(q=>{
      const life=(q.phase+time*.22)%1;
      if(life>clamp(p*2)) return;
      const spread=life*life;
      const x=sx+(tx-sx)*life+q.spread*spread*width*.24;
      const y=sy+(ty-sy)*life-Math.sin(life*Math.PI)*height*.11+Math.cos(q.phase*24)*spread*height*.14;
      const alpha=Math.sin(life*Math.PI)*(.24+.35*(1-p));
      ctx.fillStyle=`rgba(143,117,80,${alpha})`;ctx.beginPath();ctx.arc(x,y,q.size,0,Math.PI*2);ctx.fill();
    });
    copy.style.opacity=String(lowMotion() ? 1 : clamp((p-.12)/.38));
  }
  function tick(now) {
    animation=0;
    if(!visible || document.hidden || lowMotion()) {draw();return;}
    if(previous) time+=Math.min((now-previous)/1000,.06);
    previous=now;draw();
    animation=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(animation);animation=0;previous=0;
    if(visible&&!document.hidden&&!lowMotion()) animation=requestAnimationFrame(tick);else draw();
  }
  function resize() {
    width=stage.clientWidth;height=stage.clientHeight;
    const dpr=Math.min(devicePixelRatio,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);draw();header();
  }
  function header() {
    const overPhoto=[...document.querySelectorAll('.salt-room>img,.scene .room-photo')].some(img=>{
      const scene=img.closest('.scene');
      if(scene && document.body.classList.contains('motion') && scene.inert) return false;
      const r=img.getBoundingClientRect();
      return r.top<70 && r.bottom>80;
    });
    document.body.classList.toggle('salt-photo-active',overPhoto);
    document.body.classList.toggle('photo-header',overPhoto);
    const r=document.querySelector('.salt-studio').getBoundingClientRect();
    document.body.classList.toggle('salt-model-active',r.top<85&&r.bottom>0);
  }
  new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible&&!played){played=true;time=0;}sync();},{threshold:.15}).observe(stage);
  document.addEventListener('scroll',header,{passive:true,capture:true});
  const headerObserver=new IntersectionObserver(header,{threshold:[0,.1,.5,.9,1]});
  document.querySelectorAll('.salt-room,.salt-feature').forEach(el=>headerObserver.observe(el));
  window.addEventListener('hashchange',()=>requestAnimationFrame(header));window.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  let motionState=document.body.classList.contains('motion');
  new MutationObserver(()=>{const next=document.body.classList.contains('motion');if(next!==motionState){motionState=next;sync();}header();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  image.addEventListener('load',draw);
  image.addEventListener('error',()=>{if(!image.src.endsWith('device-reference.jpg')){image.src='assets/salt/device-reference.jpg';image.alt='A Bestlifepro sógenerátor eredeti fotója';}});
  resize();
})();
