(function(){
var base=document.currentScript.src.replace(/[^\/]*$/,'');
pdfjsLib.GlobalWorkerOptions.workerSrc=base+'pdfjs/pdf.worker.min.js';

function init(root){
  var src=root.dataset.src,title=root.dataset.title||'Document';
  root.innerHTML='<div class="tb">'+
    '<button type="button" data-a="prev" aria-label="Previous page">&#9650;</button>'+
    '<button type="button" data-a="next" aria-label="Next page">&#9660;</button>'+
    '<span class="pg">–</span><span class="sp"></span>'+
    '<button type="button" data-a="out" aria-label="Zoom out">&minus;</button>'+
    '<span class="zm">–</span>'+
    '<button type="button" data-a="in" aria-label="Zoom in">+</button>'+
    '<button type="button" data-a="fit">Fit width</button>'+
    '<a href="'+src+'" target="_blank" rel="noopener">Open</a>'+
    '<a href="'+src+'" download>Download</a></div>'+
    '<div class="stage" tabindex="0" aria-label="'+title.replace(/"/g,'&quot;')+' PDF"><div class="pages"></div><div class="state">Loading PDF…</div></div>';
  var $=function(s){return root.querySelector(s)};
  var stage=$('.stage'),box=$('.pages'),state=$('.state'),pgL=$('.pg'),zmL=$('.zm');
  var doc,pages=[],els=[],tasks=[],factor=1,cur=1,io=null,dpr=window.devicePixelRatio||1;

  function fitScale(p){var v=p.getViewport({scale:1});var w=Math.max(stage.clientWidth-32,200);return Math.min(w/v.width,3)}
  function layout(keep){
    tasks.forEach(function(t){try{t.cancel()}catch(e){}});tasks=[];
    if(io)io.disconnect();
    box.innerHTML='';els=[];
    var s=fitScale(pages[0])*factor;
    zmL.textContent=Math.round(s*100)+'%';
    io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting)draw(e.target)})},{root:stage,rootMargin:'700px 0px'});
    pages.forEach(function(p,i){
      var v=p.getViewport({scale:s});
      var d=document.createElement('div');d.className='page';d.style.width=v.width+'px';d.style.height=v.height+'px';d.dataset.i=i;d.dataset.s=s;
      box.appendChild(d);els.push(d);io.observe(d);
    });
    if(keep)go(cur,true);
  }
  function draw(d){
    if(d.dataset.done)return;d.dataset.done=1;
    var i=+d.dataset.i,s=+d.dataset.s,p=pages[i],v=p.getViewport({scale:s});
    var c=document.createElement('canvas');
    c.width=Math.floor(v.width*dpr);c.height=Math.floor(v.height*dpr);
    c.style.width=v.width+'px';c.style.height=v.height+'px';
    d.appendChild(c);
    var t=p.render({canvasContext:c.getContext('2d'),viewport:v,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null});
    tasks.push(t);t.promise.catch(function(){});
  }
  function go(n,instant){
    n=Math.max(1,Math.min(pages.length,n));
    var el=els[n-1];if(!el)return;
    stage.scrollTo({top:el.offsetTop-12,behavior:instant?'auto':'smooth'});
  }
  function track(){
    var y=stage.scrollTop+stage.clientHeight/3,n=1;
    for(var i=0;i<els.length;i++){if(els[i].offsetTop<=y)n=i+1}
    cur=n;pgL.textContent=n+' / '+pages.length;
    $('[data-a=prev]').disabled=n<=1;$('[data-a=next]').disabled=n>=pages.length;
  }
  function zoom(f){factor=Math.max(.4,Math.min(4,f));layout(true)}
  root.addEventListener('click',function(e){
    var b=e.target.closest('button[data-a]');if(!b||!doc)return;
    var a=b.dataset.a;
    if(a==='prev')go(cur-1);if(a==='next')go(cur+1);
    if(a==='in')zoom(factor*1.2);if(a==='out')zoom(factor/1.2);if(a==='fit')zoom(1);
  });
  stage.addEventListener('scroll',track,{passive:true});
  stage.addEventListener('keydown',function(e){
    if(!doc)return;
    if(e.key==='PageDown'||e.key==='ArrowRight'){go(cur+1);e.preventDefault()}
    if(e.key==='PageUp'||e.key==='ArrowLeft'){go(cur-1);e.preventDefault()}
    if(e.key==='+'||e.key==='='){zoom(factor*1.2)}if(e.key==='-'){zoom(factor/1.2)}
  });
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(doc&&factor===1)layout(true)},150)});

  pdfjsLib.getDocument(src).promise.then(function(d){
    doc=d;
    return Promise.all(Array.from({length:d.numPages},function(_,i){return d.getPage(i+1)}));
  }).then(function(ps){
    pages=ps;state.style.display='none';layout(false);track();
  }).catch(function(){
    state.innerHTML='Could not load this PDF.<br><a href="'+src+'" target="_blank" rel="noopener">Open it directly</a>';
    pgL.textContent='–';
    root.querySelectorAll('button').forEach(function(b){b.disabled=true});
  });
}
document.querySelectorAll('.pv[data-src]').forEach(init);
})();
