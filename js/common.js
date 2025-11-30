// js/common.js
const Common = (function(){
  // visited keys set (strings)
  const visitedKey = 'lemon_visited_keys_v1';
  // image key storage
  const imagesKey = 'lemon_images_v1';
  // background music file path - add your file to /assets/music.mp3 and update path if desired
  const MUSIC_SRC = 'assets/music.mp3';

  // a simple Set stored in sessionStorage as JSON array
  function getVisited(){
    try {
      return new Set(JSON.parse(sessionStorage.getItem(visitedKey) || '[]'));
    } catch(e){ return new Set(); }
  }
  function setVisitedSet(s){
    sessionStorage.setItem(visitedKey, JSON.stringify(Array.from(s)));
  }
  function addVisited(k){
    const s = getVisited(); s.add(k); setVisitedSet(s);
    // emit storage event (for same-tab UI updates)
    try { window.dispatchEvent(new Event('storage')); } catch(e){}
  }

  // images stored as array of base64 data URLs in sessionStorage
  function getImages(){
    try { return JSON.parse(sessionStorage.getItem(imagesKey) || '[]'); } catch(e){ return [] }
  }
  function setImages(arr){
    sessionStorage.setItem(imagesKey, JSON.stringify(arr));
  }
  function addImage(b64){
    const arr = getImages(); arr.push(b64); setImages(arr);
  }
  function removeImage(index){
    const arr = getImages(); arr.splice(index,1); setImages(arr);
  }

  // file -> base64
  function fileToBase64(file){
    return new Promise((res,rej)=>{
      const r = new FileReader();
      r.onload = ()=> res(r.result);
      r.onerror = ()=> rej();
      r.readAsDataURL(file);
    });
  }

  // visited helpers to be used by pages
  function setVisited(key){ addVisited(key); }
  function getAllVisited(){ return getVisited(); }

  /* music */
  let audio = null;
  let musicPlaying = false;
  function initMusic(){
    if (audio) return;
    try {
      audio = new Audio(MUSIC_SRC);
      audio.loop = true;
      audio.volume = 0.55;
      audio.oncanplay = ()=> { /* ready */ };
      // don't autoplay without user gesture per browser rules; we will start when user toggles
    } catch(e){}
  }
  function playMusic(){ initMusic(); if (audio && !musicPlaying){ audio.play().catch(()=>{}); musicPlaying = true; } }
  function stopMusic(){ if (audio && musicPlaying){ audio.pause(); musicPlaying = false; } }
  function toggleMusic(){
    initMusic();
    if (!musicPlaying) playMusic(); else stopMusic();
  }

  /* particles for intro: small rising emojis */
  function initIntroParticles(canvasId){
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    function resize(){ c.width = innerWidth; c.height = innerHeight; }
    resize(); window.addEventListener('resize', resize);
    const emojis = ['🍋','🎂','✨','🎀','💖','🎉'];
    const parts = [];
    for (let i=0;i<60;i++){
      parts.push({
        x: Math.random()*innerWidth,
        y: innerHeight + Math.random()*200,
        s: 14 + Math.random()*22,
        vx: (Math.random()-0.5)*0.6,
        vy: - (0.6 + Math.random()*1.2),
        e: emojis[Math.floor(Math.random()*emojis.length)],
        alpha: 0.4 + Math.random()*0.6
      });
    }
    function loop(){
      ctx.clearRect(0,0,c.width,c.height);
      for (const p of parts){
        p.x += p.vx; p.y += p.vy;
        p.alpha -= 0.0008;
        if (p.y < -80 || p.alpha <= 0){
          p.x = Math.random()*innerWidth; p.y = innerHeight + Math.random()*140;
          p.alpha = 0.6 + Math.random()*0.6; p.vy = - (0.6 + Math.random()*1.2);
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.s}px serif`;
        ctx.fillText(p.e, p.x, p.y);
        ctx.restore();
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* emoji burst effect: create many emojis that pop and fade, auto-removed */
  function emojiBurst(containerId, emojis, count){
    const container = document.getElementById(containerId);
    if(!container) return;
    for (let i=0;i<count;i++){
      const el = document.createElement('div');
      el.className = 'burst-emoji';
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      const size = 18 + Math.random()*18;
      el.style.fontSize = size + 'px';
      el.style.left = (50 + (Math.random()*160 - 80)) + 'px';
      el.style.top = '0px';
      el.style.opacity = '1';
      el.style.transform = `translateY(0) rotate(${Math.random()*40-20}deg)`;
      container.appendChild(el);
      // animate
      const dx = (Math.random()*180 - 90);
      const dy = -(100 + Math.random()*220);
      el.animate([
        { transform: `translate(0,0) scale(1)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(.9) rotate(${Math.random()*90-45}deg)`, opacity: 0 }
      ], { duration: 700 + Math.random()*500, easing:'cubic-bezier(.2,.9,.2,1)'});
      setTimeout(()=> el.remove(), 1200);
    }
  }

  /* confetti simple spawn */
  function playConfetti(){
    // small visual trick: temporarily create many emojis floating
    const root = document.createElement('div');
    root.style.position = 'fixed'; root.style.inset = '0'; root.style.pointerEvents = 'none'; root.style.zIndex = 9999;
    document.body.appendChild(root);
    const emojis = ['🎉','✨','🎂','🍋','💖'];
    for (let i=0;i<80;i++){
      const d = document.createElement('div');
      d.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      d.style.position='absolute';
      d.style.left = Math.random()*100 + '%';
      d.style.top = '-10%';
      d.style.fontSize = (10 + Math.random()*36)+'px';
      d.style.opacity = '0';
      root.appendChild(d);
      const dur = 1200 + Math.random()*1600;
      d.animate([
        { transform:'translateY(0) rotate(0deg)', opacity:0 },
        { transform:`translateY(${80+Math.random()*120}vh) rotate(${Math.random()*400-200}deg)`, opacity:1 }
      ], { duration: dur, easing:'cubic-bezier(.2,.9,.2,1)'});
      setTimeout(()=> d.remove(), dur+50);
    }
    setTimeout(()=> root.remove(), 3500);
  }

  /* small helper to decode invite and open it */
  const HIDDEN_DISCORD_B64 = "aHR0cHM6Ly9kaXNjb3JkLmdnL2V4YW1wbGU="; // REPLACE with btoa("https://discord.gg/YOURCODE")
  function openSecretInvite(){
    try {
      const url = atob(HIDDEN_DISCORD_B64);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch(e){ console.error('invite error', e) }
  }

  /* confetti & other shared utilities exposed */
  return {
    initIntroParticles,
    emojiBurst,
    playConfetti,
    fileToBase64,
    addImage,
    getImages,
    removeImage,
    setVisited: addVisited,
    getAllVisited,
    setVisited, // alias
    setVisitedKey: (k)=> setVisited(k),
    setVisitedRaw: setVisitedSet,
    setVisitedSimple: addVisited,
    visitedSet: getVisited(),
    initGlobal: function(){ initMusic(); this.visitedSet = getVisited(); },
    toggleMusic,
    playConfetti,
    fileToBase64,
    addImage,
    getImages,
    removeImage,
    getAllVisited,
    setVisited,
    emojiBurst: emojiBurst,
    openSecretInvite,
    ensureUnlocked: function(key){
      // check allowed
      const order = ['intro','memory','photos','letters','us','birthday','another'];
      const seen = getVisited();
      const next = (() => {
        let i=-1;
        for (let j=0;j<order.length;j++) if (seen.has(order[j])) i=j;
        return Math.min(order.length-1, i+1);
      })();
      const allowed = order.indexOf(key) <= next;
      if (!allowed) {
        alert('This page is locked until you visit previous surprises.');
        setTimeout(()=> location.href='hub.html', 250);
        throw new Error('locked');
      }
    },
    getImages,
    addImage,
    removeImage,
    fileToBase64,
    visitedKey,
    setVisitedKey
  };
})();
window.Common = Common;
