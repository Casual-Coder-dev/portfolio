(function(){
  var d=document,$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  var lite=matchMedia('(hover:none), (max-width:700px)').matches; /* phones/tablets: reveal once, no play-back */
  d.getElementById('y').textContent=new Date().getFullYear();

  /* header: progress bar, shrink on scroll, nav indicator, mobile menu */
  var bar=d.createElement('div');bar.className='progress';d.body.appendChild(bar);
  var top=$('.top')[0],ind=$('.ind')[0],burger=$('.burger')[0],tick=false;
  var links=$('.top nav a:not(.pill)'),secs=links.map(function(a){return d.querySelector(a.getAttribute('href'))}),foot=d.getElementById('contact'),cur=-2;
  function place(){
    var a=links[cur];
    if(!a||!ind){ind&&ind.classList.remove('on');return}
    ind.style.setProperty('--x',a.offsetLeft+'px');
    ind.style.setProperty('--y',(a.offsetTop+a.offsetHeight-2)+'px');
    ind.style.setProperty('--w',a.offsetWidth+'px');
    ind.classList.add('on');
  }
  function onScroll(){
    var y=scrollY,max=d.documentElement.scrollHeight-innerHeight,c=-1;
    bar.style.transform='scaleX('+(max>0?y/max:0)+')';
    top.classList.toggle('min',y>40);
    secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<=innerHeight*.4)c=i});
    if(foot.getBoundingClientRect().top<=innerHeight*.4)c=-1;
    if(c!==cur){cur=c;place();links.forEach(function(a,i){if(i===c)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')})}
    tick=false;
  }
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});
  addEventListener('resize',place);
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(place);
  onScroll();

  function menu(o){top.classList.toggle('open',o);burger.setAttribute('aria-expanded',String(o))}
  burger.addEventListener('click',function(){menu(!top.classList.contains('open'))});
  $('.top nav a').forEach(function(a,i){a.style.setProperty('--n',i);a.addEventListener('click',function(){menu(false)})});
  addEventListener('keydown',function(e){if(e.key==='Escape')menu(false)});
  addEventListener('resize',function(){if(innerWidth>700)menu(false)});

  /* marquee: duplicate track content for a seamless loop */
  var tr=$('.track')[0];if(tr)tr.innerHTML+=tr.innerHTML;

  /* depth-of-field toggle */
  var dofBox=d.getElementById('dof-box'),btns=$('.toggle button');
  if(dofBox)btns.forEach(function(b){b.addEventListener('click',function(){
    dofBox.classList.toggle('blur',b.dataset.f==='1');
    btns.forEach(function(o){o.setAttribute('aria-pressed',String(o===b))});
  })});

  /* FAQ accordion */
  $('.qa button').forEach(function(b){b.addEventListener('click',function(){
    var qa=b.parentNode,o=!qa.classList.contains('open');
    qa.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o));
  })});

  /* ---------- fullscreen viewer (lightbox) ---------- */
  var noop=function(){};
  var LB=(function(){
    var lb=d.getElementById('lb');if(!lb)return null;
    var stage=$('.lb-stage',lb)[0],nameEl=$('.lb-name',lb)[0],cntEl=$('.lb-count',lb)[0],ctl=$('.lb-ctl',lb)[0],
        bPlay=$('.lb-play',lb)[0],seek=$('.lb-seek',lb)[0],timeEl=$('.lb-time',lb)[0],bMute=$('.lb-mute',lb)[0],
        bX=$('.lb-x',lb)[0],bPrev=$('.lb-prev',lb)[0],bNext=$('.lb-next',lb)[0];
    var items=[],k=0,cur=null,muted=true,opener=null,onClose=null,title='',hideT=0,x0=null,moved=0;
    function isOpen(){return !lb.hidden}
    function fmt(t){t=isFinite(t)?Math.max(0,t):0;return Math.floor(t/60)+':'+('0'+Math.floor(t%60)).slice(-2)}
    function isV(){return cur&&cur.tagName==='VIDEO'}
    function syncV(){
      if(!isV())return;
      var p=!cur.paused;
      bPlay.classList.toggle('playing',p);bPlay.setAttribute('aria-label',p?'Pause video':'Play video');
      bMute.classList.toggle('muted',cur.muted);bMute.setAttribute('aria-pressed',String(cur.muted));
      bMute.setAttribute('aria-label',cur.muted?'Unmute video':'Mute video');
    }
    function syncT(){
      if(!isV())return;var dur=cur.duration||0;
      seek.value=dur?Math.round(cur.currentTime/dur*1000):0;
      seek.style.setProperty('--p',(seek.value/10)+'%');
      timeEl.textContent=fmt(cur.currentTime)+' / '+fmt(dur);
    }
    function toggle(){if(!isV())return;if(cur.paused)cur.play().catch(noop);else cur.pause()}
    function show(n,dir,t0,wasPaused){
      k=(n+items.length)%items.length;
      var el=items[k].el,v=el.tagName==='VIDEO',node;
      stage.setAttribute('data-loading','');
      if(v){
        node=d.createElement('video');
        node.src=el.currentSrc||el.src;if(el.poster)node.poster=el.poster;
        node.muted=muted;node.loop=true;node.playsInline=true;node.preload='auto';
        node.setAttribute('aria-label',el.getAttribute('aria-label')||'Video');
        ['play','pause','volumechange'].forEach(function(ev){node.addEventListener(ev,syncV)});
        ['timeupdate','loadedmetadata','durationchange'].forEach(function(ev){node.addEventListener(ev,syncT)});
        node.addEventListener('loadeddata',function(){stage.removeAttribute('data-loading')});
        node.addEventListener('volumechange',function(){muted=node.muted});
        node.addEventListener('click',toggle);
        if(t0)node.addEventListener('loadedmetadata',function(){try{node.currentTime=t0}catch(e){}},{once:true});
        if(!reduce&&!wasPaused)node.play().catch(noop);
      }else{
        node=d.createElement('img');node.alt=el.alt||'';node.draggable=false;
        node.addEventListener('load',function(){stage.removeAttribute('data-loading')});
        node.addEventListener('error',function(){stage.removeAttribute('data-loading')});
        node.src=el.dataset.full||el.currentSrc||el.src;
      }
      node.className='lb-m';node.style.setProperty('--d',dir||0);
      if(cur&&cur.tagName==='VIDEO')cur.pause();
      stage.replaceChildren(node);cur=node;
      ctl.hidden=!v;
      cntEl.textContent=items.length>1?(k+1)+' / '+items.length:'';
      bPrev.hidden=bNext.hidden=items.length<2;
      if(v){syncV();syncT()}
      /* warm the neighbours so arrows feel instant */
      if(items.length>1)[k-1,k+1].forEach(function(m){var o=items[(m+items.length)%items.length].el;if(o.tagName==='IMG'){(new Image()).src=o.dataset.full||o.src}});
    }
    function step(dir){if(items.length>1)show(k+dir,dir)}
    function setInert(on){[].forEach.call(d.body.children,function(c){if(c!==lb&&c.tagName!=='SCRIPT')c.inert=on})}
    function open(list,start,o){
      clearTimeout(hideT);
      items=list.items;title=list.title;onClose=list.onClose;opener=o||d.activeElement;
      nameEl.textContent=title;lb.classList.toggle('blur',!!list.blur);
      lb.hidden=false;setInert(true);d.documentElement.classList.add('lb-open');
      var src=items[start].el,t0=0,wasPaused=false;
      if(src.tagName==='VIDEO'){t0=src.currentTime;wasPaused=!!src.userPaused}
      show(start,0,t0,wasPaused);
      requestAnimationFrame(function(){lb.classList.add('on')});
      lb.focus({preventScroll:true});
      try{history.pushState({lb:1},'')}catch(e){}
    }
    function finish(){
      if(!isOpen())return;
      var t=0,paused=false;
      if(isV()){t=cur.currentTime;paused=cur.paused;cur.pause()}
      lb.classList.remove('on');
      hideT=setTimeout(function(){lb.hidden=true;stage.replaceChildren();cur=null},reduce?0:240);
      setInert(false);d.documentElement.classList.remove('lb-open');
      if(onClose)onClose(items[k],t,paused);
      if(opener&&opener.focus)opener.focus({preventScroll:true});
    }
    function close(){
      if(!isOpen())return;
      if(history.state&&history.state.lb)history.back();else finish();
    }
    addEventListener('popstate',function(){if(isOpen())finish()});

    bX.onclick=close;bPrev.onclick=function(){step(-1)};bNext.onclick=function(){step(1)};
    bPlay.onclick=toggle;
    bMute.onclick=function(){if(isV()){cur.muted=!cur.muted;muted=cur.muted}};
    seek.addEventListener('input',function(){if(isV()&&cur.duration){cur.currentTime=seek.value/1000*cur.duration;syncT()}});
    /* click on empty stage = close; swipe = prev/next */
    stage.addEventListener('pointerdown',function(e){x0=e.clientX;moved=0});
    stage.addEventListener('pointermove',function(e){if(x0!==null)moved=Math.max(moved,Math.abs(e.clientX-x0))});
    stage.addEventListener('pointerup',function(e){
      if(x0!==null&&moved>50&&items.length>1)step(e.clientX<x0?1:-1);x0=null});
    stage.addEventListener('pointercancel',function(){x0=null});
    stage.addEventListener('click',function(e){if(e.target===stage&&moved<6)close()});

    addEventListener('keydown',function(e){
      if(!isOpen())return;
      var onBtn=e.target&&e.target.closest&&e.target.closest('button'),onSeek=e.target===seek;
      switch(e.key){
        case 'Escape':e.preventDefault();e.stopPropagation();close();break;
        case 'ArrowLeft':if(onSeek)return;e.preventDefault();step(-1);break;
        case 'ArrowRight':if(onSeek)return;e.preventDefault();step(1);break;
        case ' ':case 'k':case 'K':if(onBtn&&e.key===' ')return;if(!isV()||onSeek)return;e.preventDefault();toggle();break;
        case 'm':case 'M':if(isV()){e.preventDefault();cur.muted=!cur.muted;muted=cur.muted}break;
        case 'Tab':{
          var f=$('button,input',lb).filter(function(el){return !el.disabled&&!el.hidden&&!el.closest('[hidden]')});
          if(!f.length)return;var first=f[0],last=f[f.length-1],a=d.activeElement;
          if(e.shiftKey&&(a===first||a===lb)){e.preventDefault();last.focus()}
          else if(!e.shiftKey&&a===last){e.preventDefault();first.focus()}
        }
      }
    },true);
    return {open:open};
  })();

  /* ---------- sliders: every .imgw (work cards) and .media (lab tiles) turns its <img>/<video>/<svg> into slides; arrows + dots only when there is more than one ---------- */
  var ARR={prev:'M15 5l-7 7 7 7',next:'M9 5l7 7-7 7',full:'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'};
  function mk(cls,label,path){var b=d.createElement('button');b.type='button';b.className='sbtn '+cls;b.setAttribute('aria-label',label);
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+path+'"/></svg>';return b}
  function vid(el,on){if(el.tagName!=='VIDEO')return;if(on){if(!reduce&&!el.userPaused)el.play().catch(noop)}else el.pause()}
  $('.imgw,.media').forEach(function(w){
    var imgs=[].slice.call(w.children).filter(function(el){return /^(IMG|VIDEO|svg)$/i.test(el.tagName)}),n=imgs.length,i=0,x0=null,dx=0,seen=true;
    var tr=d.createElement('div');tr.className='slides';imgs.forEach(function(im){
      if(im.tagName==='VIDEO'){im.defaultMuted=true;im.muted=true;im.loop=true;im.playsInline=true;im.preload='none'}
      if(im.tagName==='IMG')im.draggable=false;
      tr.appendChild(im)});w.appendChild(tr);
    var media=null;
    var pv=mk('prev','Previous image',ARR.prev),nx=mk('next','Next image',ARR.next),dots=d.createElement('div');dots.className='dots';
    var dbs=imgs.map(function(_,k){var b=d.createElement('button');b.type='button';b.setAttribute('aria-label','Show image '+(k+1));b.onclick=function(){go(k)};dots.appendChild(b);return b});
    if(n>1){w.setAttribute('aria-roledescription','carousel');w.append(pv,nx,dots)}else w.classList.add('single');
    /* play/pause button for video slides (also the way to start a clip when the visitor has reduced motion on) */
    var vb=null,hasV=imgs.some(function(im){return im.tagName==='VIDEO'});
    if(hasV){
      vb=d.createElement('button');vb.type='button';vb.className='vbtn';w.appendChild(vb);
      vb.onclick=function(){var v=imgs[i];if(v.paused){v.userPaused=false;v.play().catch(noop)}else{v.userPaused=true;v.pause()}};
      imgs.forEach(function(im){if(im.tagName==='VIDEO'){im.addEventListener('play',sync);im.addEventListener('pause',sync)}});
    }
    function sync(){
      if(!vb)return;var v=imgs[i],isV=v.tagName==='VIDEO',p=isV&&!v.paused;
      vb.hidden=!isV;vb.classList.toggle('playing',p);vb.setAttribute('aria-label',p?'Pause video':'Play video');
    }
    function go(k){i=(k+n)%n;tr.style.transform='translateX(-'+i*100+'%)';
      imgs.forEach(function(im,m){im.classList.toggle('on',m===i);vid(im,m===i&&seen)});dbs.forEach(function(b,m){b.classList.toggle('on',m===i)});sync();
      if(media)w.classList.toggle('zoomable',media.some(function(m){return m.idx===i}))}
    pv.onclick=function(){go(i-1)};nx.onclick=function(){go(i+1)};

    /* fullscreen viewer: only real photos/videos go in (not the illustration <svg>s) */
    media=[];imgs.forEach(function(im,m){if(im.tagName!=='svg')media.push({el:im,idx:m})});
    if(LB&&media.length){
      var fb=mk('xbtn','View fullscreen',ARR.full);w.appendChild(fb);
      var card=w.closest('article'),h=card&&card.querySelector('h3');
      var openViewer=function(force){
        var pos=0,onMedia=false;media.forEach(function(m,q){if(m.idx===i){pos=q;onMedia=true}});
        if(!onMedia&&force!==true)return;
        imgs.forEach(function(im){if(im.tagName==='VIDEO')im.pause()});
        LB.open({items:media,title:h?h.textContent:'',blur:w.classList.contains('blur'),
          onClose:function(m,t,paused){
            var v=m.el;go(m.idx);
            if(v.tagName==='VIDEO'){try{v.currentTime=t}catch(e){}v.userPaused=paused;if(paused)v.pause()}
          }},pos,fb);
      };
      fb.onclick=function(){openViewer(true)};
      w.addEventListener('click',function(e){
        if(e.target.closest('button')||dx>6)return;
        openViewer();
      });
    }

    w.addEventListener('pointerdown',function(e){x0=e.clientX;dx=0});
    w.addEventListener('pointermove',function(e){if(x0!==null)dx=Math.max(dx,Math.abs(e.clientX-x0))});
    w.addEventListener('pointerup',function(e){if(x0!==null&&n>1&&Math.abs(e.clientX-x0)>40)go(i+(e.clientX<x0?1:-1));x0=null});
    w.addEventListener('pointercancel',function(){x0=null});
    if(hasV)
      new IntersectionObserver(function(es){seen=es[0].isIntersecting;vid(imgs[i],seen)}).observe(w);
    go(0);
  });

  /* scroll reveal: each group has its own entrance; leaving plays it back the other way */
  function split(h){
    var t=h.textContent.trim().split(/\s+/);h.setAttribute('aria-label',t.join(' '));
    h.innerHTML=t.map(function(w,k){return '<span class="w" aria-hidden="true"><span style="--k:'+k+'">'+w+'</span></span>'}).join(' ');
  }
  var groups=[['h2','words'],['.intro','rise'],['.stats dl','rise'],['.cards .card','tilt'],['.band .two>div:first-child>*','rise'],['.quotes figure','right'],['.faq h3','rise'],['.qa','rise'],['.proj','tilt'],['.lab>.btn','pop'],['.about .two>div:first-child>*','rise'],['.marquee','wipe'],['.chips','wipe'],['.mail','wipe'],['.contact .wrap>p','rise'],['.links li','pop'],['.contact small','rise']];
  var seenEl=new Set();
  groups.forEach(function(g){var k=new Map();$(g[0]).forEach(function(el){
    if(seenEl.has(el))return;seenEl.add(el);
    var p=el.parentNode,n=k.get(p)||0;k.set(p,n+1);
    if(g[1]==='words')split(el);
    el.classList.add('rv');el.dataset.rv=g[1];el.style.setProperty('--i',n);
  })});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    var el=e.target,above=e.boundingClientRect.top<0;
    el.style.setProperty('--dir',above?-1:1);
    if(e.isIntersecting){
      el.classList.remove('out');el.classList.add('in');
      if(!reduce&&el.matches('.stats dl')&&!el.dataset.c){el.dataset.c=1;count(el.querySelector('dt'))}
      if(lite)io.unobserve(el);
    }else if(!lite&&el.classList.contains('in')){
      el.classList.remove('in');el.classList.add('out');
    }
  })},{threshold:0,rootMargin:'0px 0px -6% 0px'});
  $('.rv').forEach(function(el){io.observe(el);
    if(lite)el.addEventListener('animationend',function(e){if(e.target===el)el.classList.add('done')});
  });

  function count(dt){
    var m=/^(\d+(?:\.\d+)?)(.*)$/.exec(dt.textContent);if(!m)return;
    var end=parseFloat(m[1]),dec=(m[1].split('.')[1]||'').length,t0=performance.now();
    (function step(t){var p=Math.min((t-t0)/1100,1),v=end*(1-Math.pow(1-p,3));
      dt.textContent=v.toFixed(dec)+m[2];if(p<1)requestAnimationFrame(step)})(t0);
  }

  if(!reduce&&fine){
    /* subtle 3D tilt on cards */
    $('.card,.proj').forEach(function(c){
      c.addEventListener('pointermove',function(e){
        var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        c.style.setProperty('--ry',(x*7)+'deg');c.style.setProperty('--rx',(-y*7)+'deg');
      });
      c.addEventListener('pointerleave',function(){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')});
    });
    /* magnetic buttons */
    $('.btn,.pill,.links a').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();
        b.style.setProperty('--mx',((e.clientX-r.left-r.width/2)*.2)+'px');b.style.setProperty('--my',((e.clientY-r.top-r.height/2)*.3)+'px')});
      b.addEventListener('pointerleave',function(){b.style.setProperty('--mx','0px');b.style.setProperty('--my','0px')});
    });
  }
})();