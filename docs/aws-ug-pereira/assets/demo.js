/* demo.js — "Encendamos una idea ahora mismo": el demo en vivo de la charla.
   Habla con demo/server.py por SSE (eventos prov · step · delta · generated · deploy ·
   live · failed) y lo cuenta en un escenario de 4 fases con cronómetro:
     1 recursos en AWS → 2 la IA escribe (y la página se dibuja en vivo) →
     3 despliegue (S3 → CloudFront → el planeta se enciende) → 4 ¡está vivo!
   MODO ENSAYO (sin AWS, 100 % simulado y rotulado como tal): abrir con ?ensayo,
   Shift+clic en «Encender», o clic en una fase de la lista. */
(function(){
'use strict';
var slide=document.getElementById('demoslide');if(!slide||!window.Escenas)return;
var U=Escenas.u,E=U.E,P=U.P,clamp=U.clamp,lerp=U.lerp,hash=U.hash,rg=U.rg,lg=U.lg,rr=U.rr,circ=U.circ,tx=U.tx,icon=U.icon,
    glow=U.glow,noglow=U.noglow,col=U.col,mix=U.mix,quad=U.quad,C=U.C,F=U.F,rot=U.rot,dot3=U.dot3,D2R=U.D2R,PER=U.PER;
function $(id){return document.getElementById(id)}
var W=600,H=520,DPR=Math.min(2,window.devicePixelRatio||1);
var stage=$('stage'),bgc=$('stage-bg'),fxc=$('stage-fx'),cb=bgc.getContext('2d'),cf=fxc.getContext('2d');
var inp=$('demo-prompt'),go2=$('demo-go'),out=$('demo-out'),code=$('st-code'),brw=$('st-browser'),iaFrame=$('ia-frame'),iaWrap=$('ia-wrap'),
    res=$('demo-result'),liveFrame=$('live-frame'),liveIframe=$('live-iframe'),lfHost=$('lf-host'),urlEl=$('demo-url'),secsEl=$('demo-secs');
var ENSAYO=/[?&]ensayo\b/.test(location.search),DESDE=(location.search.match(/[?&]desde=(\w+)/)||[])[1]||null;

var ROWS=[
  {k:'s3',n:'Amazon S3',s:'donde vive',ic:'Arch_Amazon-S3_48',mk:'Creando bucket…',ok:'Creado'},
  {k:'policy',n:'Bucket privado',s:'solo vía CloudFront',ic:'Arch_AWS-Identity-and-Access-Management_48',mk:'Cerrando el bucket…',ok:'Privado'},
  {k:'cloudfront',n:'CloudFront',s:'600+ puntos',ic:'Arch_Amazon-CloudFront_48',mk:'Verificando distribución…',ok:'Desplegado'},
  {k:'bedrock',n:'Bedrock',s:'la IA',ic:'Arch_Amazon-Bedrock_48',mk:'Conectando modelo…',ok:'IA lista'},
  {k:'https',n:'HTTPS',s:'endpoint seguro',ic:'Res_Internet_48_Dark',mk:'Probando HTTPS…',ok:'HTTPS listo'}];
var DEP=[{k:'pack',n:'Empaquetando tu página',c:'empaquetar'},{k:'s3',n:'Subiendo a Amazon S3',c:'S3'},{k:'cf',n:'CloudFront la toma del origen',c:'CloudFront'},
  {k:'edge',n:'Entregando desde 600+ puntos',c:'600+ puntos'},{k:'https',n:'Servido por HTTPS al mundo',c:'HTTPS'}];
var FASES={idle:['Lista para encender','elige una idea y presiona Encender'],prov:['1/4 · Recursos en AWS','llamadas reales a tu cuenta'],
  ia:['2/4 · La IA crea tu página','Amazon Bedrock · en vivo'],deploy:['3/4 · Desplegando','S3 → CloudFront → el mundo'],
  live:['4/4 · ¡Está vivo!','por HTTPS, para cualquiera'],failed:['Algo falló','revisa la terminal del server']};
var PIDX={idle:-1,prov:0,ia:1,deploy:2,live:3,failed:-1};

/* ---------------- estado ---------------- */
var S,TERM=[];
function fresh(){var now=performance.now();S={phase:'idle',tp:now,t0:0,end:0,sim:false,prompt:inp.value||'una idea',prov:{},dep:{},
  chars:0,brief:null,briefT:0,invokeT:0,lastDelta:0,cps:0,cpsT:now,cpsC:0,iaEnd:0,liveT:0,err:''};
  TERM=[];ROWS.forEach(function(r){S.prov[r.k]={st:'idle',t:0,d:''}});DEP.forEach(function(r){S.dep[r.k]={st:'idle',t:0,d:''}})}
fresh();
var steps={},order=['prov','ia','deploy','live'];
slide.querySelectorAll('.dstep').forEach(function(d){steps[d.dataset.step]=d});
function num(d,v){d.querySelector('.di').textContent=v}
function mark(k){order.forEach(function(o,ix){var d=steps[o];if(!d)return;d.classList.remove('active','done');num(d,ix+1);
  if(o===k)d.classList.add('active');else if(order.indexOf(o)<order.indexOf(k)){d.classList.add('done');num(d,'✓')}})}
function allDone(){order.forEach(function(o){if(!steps[o])return;steps[o].classList.remove('active');steps[o].classList.add('done');num(steps[o],'✓')})}
function setPhase(p){S.phase=p;S.tp=performance.now();
  code.hidden=p!=='ia'||!S.chars;brw.hidden=!((p==='ia'&&S.chars)||p==='deploy');res.hidden=p!=='live';
  if(p!=='deploy')brw.classList.remove('pack');
  if(order.indexOf(p)>=0)mark(p)}

/* ---------------- la página se dibuja mientras la IA la escribe ---------------- */
var doc=null,started=false,pre='',codeText='',codeDirty=false,lastScroll=0;
var iaWait=$('ia-wait');
function iaReset(){codeText='';codeDirty=true;started=false;pre='';iaWait.hidden=false;
  try{doc=iaFrame.contentDocument;doc.open();doc.write('<!DOCTYPE html><html><body style="margin:0;background:#fff"></body></html>');doc.close()}catch(e){doc=null}}
function iaWrite(t){if(!S.chars){code.hidden=false;brw.hidden=false;sizeFrame()}codeText+=t;codeDirty=true;S.chars+=t.length;S.cpsC+=t.length;S.lastDelta=performance.now();
  if(!doc)return;var w=t;
  if(!started){pre+=t;var i=pre.indexOf('<');if(i<0)return;w=pre.slice(i);started=true;try{doc.open()}catch(e){}}
  w=w.replace(/```[a-z]*/g,'');if(!w)return;try{doc.write(w)}catch(e){}
  var now=performance.now();if(now-lastScroll>350){lastScroll=now;var se=doc.scrollingElement;if(se)se.scrollTo({top:se.scrollHeight,behavior:'smooth'})}}
function iaClose(){S.iaEnd=performance.now();if(!doc)return;try{doc.close()}catch(e){}
  setTimeout(function(){try{var se=doc.scrollingElement;if(se)se.scrollTo({top:0,behavior:'smooth'})}catch(e){}},500)}
function hl(s){s=s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return s.replace(/("[^"\n]*")/g,'<i class="cs">$1</i>').replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g,'$1<b class="ct">$2</b>')}
function renderCode(){if(S.phase==='ia'&&!iaWait.hidden&&doc&&doc.body&&doc.body.childElementCount>0)iaWait.hidden=true;
  if(!codeDirty)return;codeDirty=false;var tail=codeText.slice(-2400);
  out.innerHTML=hl(tail)+'<span class="caret"></span>';out.scrollTop=out.scrollHeight}
function sizeFrame(){var w=iaWrap.clientWidth,h=iaWrap.clientHeight;if(!w)return;var VW=1100,k=w/VW;
  iaFrame.style.width=VW+'px';iaFrame.style.height=(h/k)+'px';iaFrame.style.transform='scale('+k+')'}

/* ---------------- resultado: la idea se vuelve real ---------------- */
function escribirUrl(url){urlEl.textContent='';urlEl.classList.remove('typed');urlEl.href=url;var i=0;
  (function tick(){if(i<url.length){urlEl.textContent+=url[i++];setTimeout(tick,26)}else urlEl.classList.add('typed')})()}
function mostrarVivo(url,secs){setPhase('live');allDone();S.liveT=performance.now();secsEl.textContent=secs;
  lfHost.textContent=url.replace(/^https?:\/\//,'');
  liveFrame.classList.remove('on','loaded');void liveFrame.offsetWidth;liveFrame.classList.add('on');
  liveIframe.onload=function(){liveFrame.classList.add('loaded')};
  liveIframe.src=url+(url.indexOf('?')<0?'?':'&')+'v='+Date.now();
  setTimeout(function(){escribirUrl(url)},900)}

/* ---------------- manejadores (los mismos para AWS real y ensayo) ---------------- */
var es=null;
function on(src){
  src.addEventListener('prov',function(e){var d=JSON.parse(e.data),r=S.prov[d.r];if(!r)return;
    if(d.status==='creating'){if(r.st!=='creating'){r.st='creating';r.t=performance.now()}r.d=d.detail||''}
    else{r.st='done';r.t=performance.now();r.d=''}});
  src.addEventListener('api',function(e){var d=JSON.parse(e.data);if(d.cmd)TERM.push({k:'cmd',s:d.cmd,n:0,r:d.r});if(d.out)TERM.push({k:'out',s:d.out,n:0,r:d.r})});
  src.addEventListener('step',function(e){var n=JSON.parse(e.data).n;
    if(n==='ia'){iaReset();setPhase('ia');sizeFrame()}
    if(n==='deploy'){setPhase('deploy');brw.classList.add('pack')}});
  src.addEventListener('brief',function(e){S.brief=JSON.parse(e.data);S.briefT=performance.now()});
  src.addEventListener('invoke',function(){S.invokeT=performance.now()});
  src.addEventListener('delta',function(e){iaWrite(JSON.parse(e.data).t)});
  src.addEventListener('generated',function(){iaClose()});
  src.addEventListener('deploy',function(e){var d=JSON.parse(e.data),r=S.dep[d.n];if(!r)return;
    if(d.status==='creating'){if(r.st!=='creating'){r.st='creating';r.t=performance.now()}r.d=d.detail||''}
    else{r.st='done';r.t=performance.now();r.d=d.detail||''}});
  src.addEventListener('live',function(e){var d=JSON.parse(e.data);S.end=performance.now();
    setTimeout(function(){mostrarVivo(d.url,d.secs);go2.disabled=false},900);src.close()});
  src.addEventListener('failed',function(e){S.err=JSON.parse(e.data).error||'error';S.end=performance.now();setPhase('failed');
    order.forEach(function(k){if(steps[k])steps[k].classList.remove('active')});go2.disabled=false;src.close()});
  src.onerror=function(){if(S.phase!=='live'&&S.phase!=='failed'){S.err=S.chars||S.prov.s3.st!=='idle'?'se cortó la conexión con el server':'no hay server: corre demo/presentar.sh (o ensaya con Shift+clic)';
    S.end=performance.now();setPhase('failed');go2.disabled=false}src.close()}}

/* ---------------- ensayo: misma secuencia de eventos, sin tocar AWS ---------------- */
var MUESTRA=null;fetch('demo/site/_preview.html').then(function(r){return r.ok?r.text():null}).then(function(t){MUESTRA=t}).catch(function(){});
function Ensayo(from){var L={},T=[],t=0,self=this;this.sim=true;
  this.addEventListener=function(n,f){L[n]=f};this.close=function(){T.forEach(clearTimeout);T=[]};
  function at(dt,ev,d){t+=dt;if(!ev)return;T.push(setTimeout(function(){if(L[ev])L[ev]({data:JSON.stringify(d||{})})},t))}
  var fi=order.indexOf(from||'prov');
  var B='encender-tu-idea-demo',SC={s3:[['aws s3api create-bucket --bucket '+B+' --region us-east-1','{ "Location": "/'+B+'" }  HTTP 200'],['aws s3api wait bucket-exists --bucket '+B,'✓ bucket-exists']],
    policy:[['aws s3api put-public-access-block --bucket '+B+' --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true','HTTP 200  ·  nadie entra directo al bucket'],
      ['aws s3api put-bucket-policy --bucket '+B+' --policy \'{"Principal":{"Service":"cloudfront.amazonaws.com"},"Action":"s3:GetObject","Condition":{"StringEquals":{"AWS:SourceArn":"arn:aws:cloudfront::123456789012:distribution/E1ENSAYO000"}}}\'','HTTP 204  ·  solo esta distribución de CloudFront puede leer'],
      ['aws s3api get-bucket-policy-status --bucket '+B,'{ "PolicyStatus": { "IsPublic": false } }  →  privado ✓']],
    cloudfront:[['aws cloudfront get-distribution --id E1ENSAYO000 --query Distribution.Status','"Deployed"  →  d1ensayo.cloudfront.net  ·  origen privado con OAC ✓']],
    bedrock:[['aws bedrock list-inference-profiles --max-results 1','HTTP 200  ·  modelo: us.anthropic.claude (ensayo)']],
    https:[['curl -sI https://'+B+'.s3.us-east-1.amazonaws.com/index.html','HTTP 403 AccessDenied  ·  directo al bucket: bloqueado ✓'],['curl -sI https://d1ensayo.cloudfront.net/','HTTP/2 200  ·  TLS ✓']]};
  if(fi<=0)ROWS.forEach(function(r){at(250,'prov',{r:r.k,status:'creating'});var t1=t;
    SC[r.k].forEach(function(cm){at(150,'api',{r:r.k,cmd:cm[0]});if(r.k==='cloudfront')for(var i=1;i<=2;i++)at(900,'prov',{r:r.k,status:'creating',detail:'propagando a 600+ puntos · '+i+'s'});
      at(cm[0].length/55*1000+500,'api',{r:r.k,out:cm[1]});at(600)});
    at(Math.max(400,7000-(t-t1)),'prov',{r:r.k,status:'done'})});
  if(fi<=1){at(400,'step',{n:'ia'});at(200,'brief',{prompt:S.prompt,model:'us.anthropic.claude (ensayo)',max_tokens:8000,cmd:'aws bedrock-runtime invoke-model-with-response-stream --model-id us.anthropic.claude (ensayo)'});at(7000,'invoke',{});at(1500);var html=MUESTRA||'<!DOCTYPE html><html><body style="font:48px system-ui;padding:80px;background:#151D25;color:#fff"><h1>Tu idea ☕</h1><p>(muestra de ensayo)</p></body></html>';
    for(var k=0;k<html.length;k+=80)at(fi===1||k%640?30:30,'delta',{t:html.slice(k,k+80)});at(200,'generated',{})}
  else{T.push(setTimeout(function(){iaReset();if(MUESTRA)iaWrite(MUESTRA);iaClose()},0))}
  if(fi<=2){at(300,'step',{n:'deploy'});var det=['26.6 KB','confirmado','página nueva ✓','punto de presencia BOG50-P1','HTTPS 200'];
    DEP.forEach(function(r,i){at(200,'deploy',{n:r.k,status:'creating'});if(r.k==='cf')at(1400,'deploy',{n:r.k,status:'creating',detail:'CloudFront leyendo el origen · 2s'});at(r.k==='cf'?1400:2800,'deploy',{n:r.k,status:'done',detail:det[i]})})}
  at(400,'live',{url:location.origin+location.pathname.replace(/[^/]*$/,'')+'demo/site/_preview.html',secs:Math.round(t/1000)+1})}

function run(e,from){if(es)es.close();fresh();S.t0=performance.now();S.prompt=inp.value||'una idea';go2.disabled=true;
  res.hidden=true;liveFrame.classList.remove('on','loaded');liveIframe.removeAttribute('src');
  var sim=ENSAYO||(e&&e.shiftKey)||!!from;S.sim=sim;setPhase(from&&from!=='prov'?from:'prov');
  es=sim?new Ensayo(from):new EventSource('/api/enciende?p='+encodeURIComponent(S.prompt));on(es)}
go2.addEventListener('click',function(e){run(e,ENSAYO?DESDE:null)});
inp.addEventListener('keydown',function(e){if(e.key==='Enter')run(e,ENSAYO?DESDE:null)});
slide.querySelectorAll('.chip-idea').forEach(function(c){c.addEventListener('click',function(){
  slide.querySelectorAll('.chip-idea').forEach(function(x){x.classList.remove('sel')});c.classList.add('sel');inp.value=c.dataset.idea;if(S.phase==='idle')S.prompt=inp.value})});
inp.addEventListener('input',function(){if(S.phase==='idle')S.prompt=inp.value});
slide.querySelectorAll('.dstep').forEach(function(d){d.style.cursor='pointer';d.title='ensayo de esta fase (simulado)';
  d.addEventListener('click',function(){if(go2.disabled&&!S.sim)return;run(null,d.dataset.step==='live'?'deploy':d.dataset.step)})});

/* ================= escenario (canvas) ================= */
var NX=[80,190,300,410,520],NY=[220,194,184,194,220],CAP={x:300,y:114};
var G={x:392,y:306,R:146},PG={x:96,y:160},PS={x:96,y:270},PC={x:96,y:380};
var PTS=null,ARCS=null;
function prepGlobe(){if(PTS)return;PTS=U.globo();var r=U.rng(9);ARCS=[];
  for(var i=0;i<60&&ARCS.length<26;i++){var p=PTS[Math.floor(r()*PTS.length)],d=dot3(p.v,PER);if(d>.93||d<-.2)continue;ARCS.push({B:p.v,om:Math.acos(clamp(d,-1,1)),T:r()})}
  ARCS.sort(function(a,b){return a.om-b.om})}
var lastW=0;
function fit(){var w=stage.clientWidth,h=stage.clientHeight;if(!w||w===lastW)return;lastW=w;
  [bgc,fxc].forEach(function(cv){cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR)});sizeFrame()}
function sec(ms){return ms/1000}
function crono(now){if(!S.t0)return'0:00.0';var d=Math.floor(((S.end||now)-S.t0)/100),m=Math.floor(d/600),r=d-m*600,ss=Math.floor(r/10);return m+':'+(ss<10?'0':'')+ss+'.'+(r%10)}

function header(c,now){
  var ph=S.phase==='ia'&&!S.chars?['2/4 · Diseñando tu página','el pedido para Amazon Bedrock']:FASES[S.phase];
  tx(c,crono(now),24,42,{s:30,w:700,f:'mono',c:S.phase==='live'?C.g2:'#fff'});
  tx(c,S.t0?(S.end?'tiempo total':'cronómetro en vivo'):'cronómetro',24,58,{s:10.5,f:'mono',c:C.dfaint});
  if(S.t0&&!S.end){var bl=.5+.5*Math.sin(now/180);c.fillStyle=col(C.red,.5+.5*bl);circ(c,150,33,4);c.fill()}
  tx(c,ph[0],576,34,{s:16,w:700,f:'display',c:S.phase==='live'?C.g2:S.phase==='failed'?C.red:'#fff',a:'right'});
  tx(c,S.sim&&S.t0?'MODO ENSAYO · simulado, sin AWS':ph[1],576,52,{s:10.5,w:S.sim&&S.t0?700:400,f:'mono',c:S.sim&&S.t0?'#ffd166':C.dfaint,a:'right'});
  // pista de 4 segmentos
  var pi=PIDX[S.phase],sw=(552-24)/4;
  for(var i=0;i<4;i++){var x=24+i*(sw+8),f=0;
    if(i<pi||S.phase==='live')f=1;else if(i===pi)f=progreso(now);
    rr(c,x,64,sw,4,2);c.fillStyle='#253240';c.fill();
    if(f>0){rr(c,x,64,sw*f,4,2);c.fillStyle=S.phase==='live'?C.g2:lg(c,x,0,x+sw,0,[[0,C.o],[1,C.r]]);glow(c,'rgba(255,153,0,.6)',6);c.fill();noglow(c)}
    if(i===pi&&S.phase!=='live'){var sh=(now/900)%1;c.fillStyle='rgba(255,255,255,.55)';c.fillRect(x+sw*f*sh-6,64,6,4)}}}
function progreso(now){if(S.phase==='prov'){var n=0;ROWS.forEach(function(r){var s=S.prov[r.k];n+=s.st==='done'?1:s.st==='creating'?.4:0});return n/5}
  if(S.phase==='ia')return S.iaEnd?1:1-Math.exp(-S.chars/9000);
  if(S.phase==='deploy'){var m=0;DEP.forEach(function(r){var s=S.dep[r.k];m+=s.st==='done'?1:s.st==='creating'?.4:0});return m/5}return 0}

function capsula(c,now,a){c.save();c.globalAlpha=a;var txt=S.prompt.length>64?S.prompt.slice(0,62)+'…':S.prompt,fs=15;c.font='500 15px '+F.body;var mw=c.measureText(txt).width;if(mw>484){fs=15*484/mw;mw=484}var w=mw+44;
  var pul=.5+.5*Math.sin(now/500);
  tx(c,'tu idea',CAP.x,CAP.y-28,{s:10.5,f:'mono',c:C.dfaint,a:'center'});
  rr(c,CAP.x-w/2,CAP.y-20,w,40,20);c.fillStyle='rgba(255,153,0,.1)';glow(c,'rgba(255,153,0,'+(.3+.3*pul)+')',16);c.fill();noglow(c);
  c.strokeStyle=lg(c,CAP.x-w/2,0,CAP.x+w/2,0,[[0,C.o],[1,C.r]]);c.lineWidth=1.8;c.stroke();
  c.fillStyle=C.o;c.beginPath();var sx=CAP.x-w/2+18,sy=CAP.y;c.moveTo(sx,sy-6);c.lineTo(sx+1.6,sy-1.6);c.lineTo(sx+6,sy);c.lineTo(sx+1.6,sy+1.6);c.lineTo(sx,sy+6);c.lineTo(sx-1.6,sy+1.6);c.lineTo(sx-6,sy);c.lineTo(sx-1.6,sy-1.6);c.fill();
  tx(c,txt,CAP.x+8,CAP.y+5,{s:fs,w:500,c:'#fff',a:'center'});c.restore()}

function nodo(c,now,i,st,t,a){var x=NX[i],y=NY[i],r=30,R=ROWS[i],el=sec(now-t);c.save();c.globalAlpha=a;
  if(st==='creating'){var pu=.5+.5*Math.sin(now/260);c.fillStyle=rg(c,x,y,r*.5,r+26,[[0,'rgba(255,153,0,'+(.25+.2*pu)+')'],[1,'rgba(255,153,0,0)']]);circ(c,x,y,r+26);c.fill()}
  if(st==='done'){c.fillStyle=rg(c,x,y,r*.5,r+22,[[0,'rgba(172,91,255,.22)'],[1,'rgba(172,91,255,0)']]);circ(c,x,y,r+22);c.fill();
    var bk=P(el,0,.7);if(bk<1){c.strokeStyle='rgba(61,208,127,'+(1-bk)+')';c.lineWidth=2.5;circ(c,x,y,r+4+34*E.out(bk));c.stroke()}}
  circ(c,x,y,r);c.fillStyle='#172029';c.fill();
  c.strokeStyle=st==='done'?lg(c,x-r,y-r,x+r,y+r,[[0,C.p],[1,C.t]]):st==='creating'?C.o:'#2e3a48';c.lineWidth=st==='idle'?1.6:2.4;c.stroke();
  if(st==='creating'){var an=now/320;c.strokeStyle=C.o;c.lineWidth=3;glow(c,'rgba(255,153,0,.8)',8);c.beginPath();c.arc(x,y,r+7,an,an+1.4);c.stroke();
    c.strokeStyle='rgba(255,153,0,.45)';c.beginPath();c.arc(x,y,r+7,an+Math.PI,an+Math.PI+.8);c.stroke();noglow(c)}
  var s=st==='done'?34+4*E.out(P(el,0,.4))*(1-P(el,.4,.4)):32;icon(c,R.ic,x,y,s,st==='idle'?.22:st==='creating'?.8:1);
  if(st==='done'){var ck=E.back(P(el,.1,.4));c.save();c.translate(x+22,y-22);c.scale(ck,ck);c.fillStyle=C.g;circ(c,0,0,9);c.fill();
    c.strokeStyle='#fff';c.lineWidth=2.2;c.beginPath();c.moveTo(-4,0);c.lineTo(-1,3.5);c.lineTo(4.5,-3.5);c.stroke();c.restore()}
  tx(c,R.n,x,y+47,{s:13.5,w:700,f:'display',c:'#fff',a:'center',al:st==='idle'?.45:1});
  tx(c,st==='done'?'✓ '+R.ok:st==='creating'?'creando…':R.s,x,y+63,{s:11,f:'mono',c:st==='done'?C.g2:st==='creating'?C.o:C.dfaint,a:'center'});
  c.restore()}

function haz(c,now,i,st,t){var x=NX[i],y=NY[i]-34,cp=[(CAP.x+x)/2,CAP.y+40],A=[CAP.x,CAP.y+20],B=[x,y];
  if(st==='idle')return;
  c.beginPath();c.moveTo(A[0],A[1]);c.quadraticCurveTo(cp[0],cp[1],B[0],B[1]);
  if(st==='creating'){c.strokeStyle='rgba(255,153,0,.7)';c.lineWidth=1.8;c.setLineDash([5,6]);c.lineDashOffset=-now/40;c.stroke();c.setLineDash([]);
    var k=(now/900)%1,q=quad(A,B,cp,k);c.fillStyle=rg(c,q[0],q[1],0,8,[[0,'rgba(255,255,255,.95)'],[1,'rgba(255,153,0,0)']]);circ(c,q[0],q[1],8);c.fill()}
  else{c.strokeStyle=lg(c,A[0],A[1],B[0],B[1],[[0,'rgba(172,91,255,.55)'],[1,'rgba(65,179,255,.55)']]);c.lineWidth=1.8;c.stroke();
    var k2=((now/1300)+i*.21)%1,q2=quad(A,B,cp,k2);c.fillStyle='rgba(65,179,255,'+(1-k2)+')';circ(c,q2[0],q2[1],2.6);c.fill()}}

function escenaProv(c,now,idle){var a=idle?.55:1;capsula(c,now,a);
  for(var i=0;i<5;i++){var r=S.prov[ROWS[i].k];if(!idle)haz(c,now,i,r.st,r.t);nodo(c,now,i,idle?'idle':r.st,r.t,idle?.8:1)}
  terminal(c,now,idle)}

/* terminal: el equivalente AWS CLI de cada llamada real, tecleado en vivo */
var lastT=0;
function wrap(str,n){var o=[];while(str.length>n){o.push(str.slice(0,n));str=str.slice(n)}o.push(str);return o}
function terminal(c,now,idle){var dt=Math.min(3,(now-(lastT||now))/1000);lastT=now;var head=null;
  for(var i=0;i<TERM.length;i++){var L=TERM[i];if(L.n<L.s.length){L.n=Math.min(L.s.length,L.n+dt*(L.k==='cmd'?55:420));head=L;break}}
  var X=24,Y=296,Wd=552,Hd=212;rr(c,X,Y,Wd,Hd,12);c.fillStyle='#0a1017';c.fill();c.strokeStyle='#2a3643';c.lineWidth=1;c.stroke();
  c.save();rr(c,X,Y,Wd,Hd,12);c.clip();c.fillStyle='#141c25';c.fillRect(X,Y,Wd,24);c.restore();
  ['#ff5f57','#febc2e','#28c840'].forEach(function(cc,j){c.fillStyle=cc;circ(c,X+14+j*12,Y+12,3.6);c.fill()});
  tx(c,'terminal · AWS CLI (llamadas reales)',X+54,Y+16,{s:10.5,f:'mono',c:C.dfaint});
  var act=null;ROWS.forEach(function(R){if(S.prov[R.k].st==='creating')act=R});
  if(act){var d=S.prov[act.k].d||act.mk;tx(c,d,X+Wd-14,Y+16,{s:10.5,w:700,f:'mono',c:C.o,a:'right'})}
  else if(!idle&&ROWS.every(function(R){return S.prov[R.k].st==='done'}))tx(c,'✓ infraestructura lista',X+Wd-14,Y+16,{s:10.5,w:700,f:'mono',c:C.g2,a:'right'});
  var vis=[],N=82;
  if(idle)vis.push({t:'# presiona Encender: aquí se verá cada llamada a la API de AWS',c:'#5d6f80'});
  TERM.forEach(function(L){if(L.n<=0&&L!==head)return;var shown=L.s.slice(0,Math.floor(L.n)),parts=wrap((L.k==='cmd'?'$ ':'  ')+shown,N);
    parts.forEach(function(p,j){vis.push({t:p,k:L.k,first:j===0,typing:L.n<L.s.length&&j===parts.length-1,ok:/✓|HTTP\/?2? ?20|Deployed/.test(L.s)})})});
  var LH=15.5,maxL=11,start=Math.max(0,vis.length-maxL),y=Y+44;
  c.font='400 10.5px '+F.mono;c.textAlign='left';c.textBaseline='alphabetic';
  for(var j=start;j<vis.length;j++){var v=vis[j],x=X+14;
    if(v.c){tx(c,v.t,x,y,{s:10.5,f:'mono',c:v.c})}
    else if(v.k==='cmd'){if(v.first){tx(c,'$',x,y,{s:10.5,w:700,f:'mono',c:C.o});var rest=v.t.slice(2),m=rest.match(/^(\S+ \S+ \S+)(.*)$/);
        if(m){tx(c,m[1],x+13,y,{s:10.5,w:700,f:'mono',c:'#7cc4ff'});c.font='700 10.5px '+F.mono;var w1=c.measureText(m[1]).width;tx(c,m[2],x+13+w1,y,{s:10.5,f:'mono',c:'#e6edf3'})}
        else tx(c,rest,x+13,y,{s:10.5,f:'mono',c:'#e6edf3'})}
      else tx(c,v.t,x,y,{s:10.5,f:'mono',c:'#e6edf3'})}
    else tx(c,v.t,x,y,{s:10.5,f:'mono',c:v.ok?C.g2:'#9fb0c0'});
    if(v.typing||(j===vis.length-1&&!idle&&!v.typing&&Math.floor(now/450)%2===0)){c.font='400 10.5px '+F.mono;var cw=c.measureText(v.t).width;if(v.typing||Math.floor(now/450)%2===0){c.fillStyle=C.o;c.fillRect(x+cw+2,y-9,6,11)}}
    y+=LH}
  if(idle&&Math.floor(now/450)%2===0){c.fillStyle=C.o;c.fillRect(X+14,y-9,6,11)}}

var REGLAS=['Hero cinematográfico a pantalla completa','Colores y estilo propios del rubro','Tipografía protagonista, con carácter','Animaciones de entrada sutiles','Responsive: celular y pantalla grande','Textos en español, nada de plantillas'];
function escenaBrief(c,now){var el=S.briefT?sec(now-S.briefT):0,b=S.brief;
  // Bedrock "pensando"
  var cx=512,cy=148,sp=now/1000;c.fillStyle=rg(c,cx,cy,10,70,[[0,'rgba(1,168,141,.28)'],[1,'rgba(1,168,141,0)']]);circ(c,cx,cy,70);c.fill();
  for(var o=0;o<2;o++){c.save();c.translate(cx,cy);c.rotate(o?-.5:.6);c.strokeStyle=o?'rgba(65,179,255,.55)':'rgba(172,91,255,.55)';c.lineWidth=1.4;c.setLineDash([4,6]);c.lineDashOffset=-sp*30*(o?-1:1);
    c.beginPath();c.ellipse(0,0,50,20,0,0,Math.PI*2);c.stroke();c.setLineDash([]);var an=sp*(o?-1.6:1.3)+o*2;c.fillStyle=o?C.t:C.p;circ(c,Math.cos(an)*50,Math.sin(an)*20,3);c.fill();c.restore()}
  icon(c,'Arch_Amazon-Bedrock_48',cx,cy,44);
  tx(c,'Diseñando tu página',24,104,{s:22,w:800,f:'display',c:'#fff'});
  tx(c,'armamos el pedido para Amazon Bedrock',24,124,{s:12,f:'mono',c:C.dfaint});
  // tu pedido
  rr(c,24,146,408,62,12);c.fillStyle='rgba(255,153,0,.08)';c.fill();c.strokeStyle='rgba(255,153,0,.55)';c.lineWidth=1.4;c.stroke();
  tx(c,'lo que pediste',38,166,{s:10.5,f:'mono',c:C.o});
  var pr=(b?b.prompt:S.prompt);pr=pr.length>44?pr.slice(0,42)+'…':pr;tx(c,'«'+pr+'»',38,193,{s:16,w:600,c:'#fff',al:E.out(P(el,.1,.5))});
  // reglas de diseño que viajan en el prompt
  tx(c,'instrucciones de diseño que van con tu idea',24,236,{s:10.5,f:'mono',c:C.dfaint});
  REGLAS.forEach(function(r,i){var k=P(el,.6+i*.55,.4);if(k<=0)return;var x=24+(i%2)*278,y=262+Math.floor(i/2)*30;
    c.globalAlpha=k;c.fillStyle='rgba(255,255,255,.04)';rr(c,x,y-17,266,25,8);c.fill();
    c.fillStyle=C.g;circ(c,x+13,y-4.5,6.5);c.fill();c.strokeStyle='#fff';c.lineWidth=1.8;c.beginPath();c.moveTo(x+10,y-4.5);c.lineTo(x+12.3,y-2);c.lineTo(x+16.5,y-7);c.stroke();
    tx(c,r,x+26,y,{s:12,c:'#e6edf3'});c.globalAlpha=1});
  // la llamada
  var X=24,Y=362,Wd=552,Hd=100;rr(c,X,Y,Wd,Hd,12);c.fillStyle='#0a1017';c.fill();c.strokeStyle='#2a3643';c.lineWidth=1;c.stroke();
  var cmd=b?b.cmd:'aws bedrock-runtime invoke-model-with-response-stream',n=Math.floor(clamp((el-3.6)*55,0,cmd.length)),shown=cmd.slice(0,n),parts=[];
  var full='$ '+shown;while(full.length>82){parts.push(full.slice(0,82));full=full.slice(82)}parts.push(full);
  parts.forEach(function(p,j){tx(c,p,X+14,Y+24+j*16,{s:10.5,f:'mono',c:j===0?'#7cc4ff':'#e6edf3'})});
  if(n>0&&Math.floor(now/450)%2===0){c.font='400 10.5px '+F.mono;c.fillStyle=C.o;c.fillRect(X+16+c.measureText(parts[parts.length-1]).width,Y+15+(parts.length-1)*16,6,11)}
  if(b&&n>=cmd.length)tx(c,'  max_tokens '+b.max_tokens+' · streaming: la página llega palabra por palabra',X+14,Y+24+parts.length*16,{s:10.5,f:'mono',c:C.dfaint});
  var wait=S.invokeT?sec(now-S.invokeT):0,an=now/200;
  if(S.invokeT){c.strokeStyle=C.o;c.lineWidth=2.6;c.beginPath();c.arc(X+22,Y+Hd-18,7,an,an+4.2);c.stroke();
    tx(c,'esperando la primera palabra de la IA… '+wait.toFixed(1)+' s',X+38,Y+Hd-14,{s:12,w:700,f:'mono',c:C.o})}
  else if(el>0)tx(c,'preparando el pedido…',X+14,Y+Hd-14,{s:12,f:'mono',c:C.dmuted});
  tx(c,'cómo le pedimos las cosas a la IA importa tanto como la IA',300,500,{s:10.5,f:'mono',c:C.dfaint,a:'center'})}

function escenaIA(c,now){if(!S.chars)return escenaBrief(c,now);
  // estado de Bedrock
  icon(c,'Arch_Amazon-Bedrock_48',40,99,30);
  tx(c,S.iaEnd?'Amazon Bedrock terminó tu página':'Amazon Bedrock está escribiendo tu página',64,95,{s:15,w:700,f:'display',c:'#fff'});
  var dt=sec(now-S.cpsT);if(dt>.5){S.cps=Math.round(S.cpsC/dt);S.cpsC=0;S.cpsT=now}
  tx(c,(S.chars/1024).toFixed(1)+' KB escritos'+(S.iaEnd?' · lista':' · '+U.nf(S.cps)+' caracteres/s'),64,112,{s:11,f:'mono',c:C.o});
  if(!S.iaEnd){var bl=.5+.5*Math.sin(now/200);c.fillStyle=col(C.red,.6+.4*bl);circ(c,514,99,4.5);c.fill();tx(c,'EN VIVO',576,103,{s:11,w:700,f:'mono',c:'#ff8a8a',a:'right'})}
  else tx(c,'✓ generada',576,103,{s:11,w:700,f:'mono',c:C.g2,a:'right'});
  // halo detrás del navegador
  var act=!S.iaEnd&&now-S.lastDelta<400;
  c.fillStyle=rg(c,436,316,60,260,[[0,'rgba(255,153,0,'+(act?.2:.1)+')'],[1,'rgba(255,153,0,0)']]);c.fillRect(250,110,350,410);
  // flujo código → página
  c.globalCompositeOperation='lighter';
  for(var i=0;i<18;i++){var ph=((now/700)+i/18)%1,y=150+((i*53)%330),x=256+ph*44,a=(act||!S.iaEnd?1:.2)*E.bump(ph);
    c.fillStyle=i%3?col(C.o,.9*a):col(C.p,.9*a);circ(c,x,y,1.8+1.2*a);c.fill()}
  c.globalCompositeOperation='source-over'}

function packet(c,x,y,s,a){c.save();c.globalAlpha*=a;c.translate(x,y);c.scale(s,s);glow(c,'rgba(255,153,0,.8)',10);rr(c,-9,-11,18,22,3);c.fillStyle='#fff';c.fill();noglow(c);
  c.fillStyle=C.o;c.fillRect(-6,-7,12,3);c.fillStyle='#c9d2dc';c.fillRect(-6,-1,12,2);c.fillRect(-6,3,8,2);c.restore()}
function escenaDeploy(c,now){prepGlobe();var el=sec(now-S.tp);
  var st=function(k){return S.dep[k].st},tk=function(k){return sec(now-S.dep[k].t)};
  var edgeK=st('edge')==='done'||st('https')!=='idle'?1:st('edge')==='creating'?clamp(tk('edge')/7,0,1):0;
  // globo
  var l0=(-66+8*Math.sin(now/9000))*D2R,p0=8*D2R,gx=G.x,gy=G.y,R=G.R,ga=E.out(P(el,.3,.8));
  c.globalAlpha=ga;c.globalCompositeOperation='lighter';c.fillStyle=rg(c,gx,gy,R*.7,R*1.3,[[0,'rgba(172,91,255,.14)'],[1,'rgba(172,91,255,0)']]);circ(c,gx,gy,R*1.3);c.fill();
  c.globalCompositeOperation='source-over';c.fillStyle=rg(c,gx-R*.35,gy-R*.4,R*.1,R*1.05,[[0,'#223040'],[1,'#0e141b']]);circ(c,gx,gy,R);c.fill();c.strokeStyle='rgba(65,179,255,.25)';c.lineWidth=1;c.stroke();
  var th=Math.cos(edgeK*Math.PI);
  for(var i=0;i<PTS.length;i+=1){var p=PTS[i],q=rot(p.v,l0,p0);if(q[2]<=0)continue;var X=gx+R*q[0],Y=gy-R*q[1],s=.55+.7*q[2],a=.15+.65*q[2];
    var lit=edgeK>0&&p.dp>=th,front=lit&&edgeK<1?clamp(1-(p.dp-th)/.08,0,1):0;
    c.fillStyle=lit?(front>0?'rgba(255,240,210,'+(a+.3)+')':col(C.o,a)):'rgba(170,182,194,'+(a*.8)+')';c.fillRect(X-s,Y-s,2*s,2*s)}
  // arcos desde Colombia
  var qp=rot(PER,l0,p0),PX=gx+R*qp[0],PY=gy-R*qp[1];
  if(edgeK>0){c.globalCompositeOperation='lighter';ARCS.forEach(function(ar,j){var T=ar.T*.7;var lt=(edgeK>=1?((now/1000+ar.T*5)%4)/1.6:(edgeK-T)/.3);if(lt<=0)return;
      var head=E.out(clamp(lt,0,1)),tail=edgeK>=1?E.io(clamp(lt-.6,0,1)):0,so=Math.sin(ar.om);if(head<=tail)return;
      c.lineWidth=1.4;var prev=null;for(var k=0;k<=20;k++){var s=tail+(head-tail)*k/20,k1=Math.sin((1-s)*ar.om)/so,k2=Math.sin(s*ar.om)/so,h=1+.12*Math.sin(Math.PI*s),
        v=[(PER[0]*k1+ar.B[0]*k2)*h,(PER[1]*k1+ar.B[1]*k2)*h,(PER[2]*k1+ar.B[2]*k2)*h],q=rot(v,l0,p0);
        if(prev&&q[2]>-.02&&prev[2]>-.02){c.strokeStyle=col(C.o,.15+.7*k/20);c.beginPath();c.moveTo(gx+R*prev[0],gy-R*prev[1]);c.lineTo(gx+R*q[0],gy-R*q[1]);c.stroke()}prev=q}});
    c.globalCompositeOperation='source-over'}
  if(qp[2]>0){c.fillStyle=rg(c,PX,PY,0,16,[[0,'rgba(255,220,160,.9)'],[1,'rgba(255,153,0,0)']]);circ(c,PX,PY,16);c.fill();c.fillStyle='#fff';circ(c,PX,PY,2.6);c.fill();
    tx(c,'Pereira',PX-8,PY-8,{s:11,w:700,c:'#ffd9a0',a:'right'})}
  c.globalAlpha=1;
  // HTTPS: candado sobre el planeta
  if(st('https')!=='idle'){var hk=E.back(P(tk('https'),0,.5)),ok=st('https')==='done';c.save();c.translate(gx,gy+R+2);c.scale(hk,hk);
    rr(c,-50,-15,100,30,15);c.fillStyle=ok?'rgba(18,161,90,.9)':'rgba(21,29,37,.9)';c.fill();c.strokeStyle=ok?C.g2:C.o;c.lineWidth=1.6;c.stroke();
    c.strokeStyle='#fff';c.lineWidth=1.8;c.beginPath();c.arc(-30,-3,4,Math.PI,0);c.stroke();rr(c,-35.5,-3,11,9,2);c.fillStyle='#fff';c.fill();
    tx(c,'HTTPS',8,5,{s:13,w:700,f:'mono',c:'#fff',a:'center'});c.restore()}
  // columna: tu página → S3 → CloudFront
  var pk=E.back(P(el,.8,.5));
  [[PG,PS],[PS,PC]].forEach(function(seg,j){c.strokeStyle=j===0?(st('s3')!=='idle'?'rgba(65,179,255,.7)':'#2e3a48'):(st('cf')!=='idle'?'rgba(65,179,255,.7)':'#2e3a48');c.lineWidth=2.5;
    c.beginPath();c.moveTo(seg[0].x,seg[0].y+32);c.lineTo(seg[1].x,seg[1].y-32);c.stroke()});
  var cfOn=st('edge')!=='idle';c.strokeStyle=cfOn?'rgba(255,153,0,.75)':'#2e3a48';c.lineWidth=2.5;c.beginPath();c.moveTo(PC.x+32,PC.y);c.quadraticCurveTo(PX-40,PC.y,PX-4,PY+4);c.stroke();
  // paquetes viajando
  if(st('s3')==='creating'){var k1=(now/900)%1;packet(c,PG.x,lerp(PG.y+30,PS.y-30,E.io(k1)),.9,1-k1*.3)}
  if(st('cf')==='creating'){var k3=(now/900)%1;packet(c,PS.x,lerp(PS.y+30,PC.y-30,E.io(k3)),.9,1-k3*.3)}
  if(st('edge')==='creating'){for(var m=0;m<3;m++){var k4=((now/1100)+m/3)%1,q4=quad([PC.x+32,PC.y],[PX-4,PY+4],[PX-40,PC.y],E.io(k4));c.fillStyle=rg(c,q4[0],q4[1],0,9,[[0,'rgba(255,255,255,.95)'],[1,'rgba(255,153,0,0)']]);circ(c,q4[0],q4[1],9);c.fill()}}
  // nodos
  c.save();c.translate(PG.x,PG.y);c.scale(pk,pk);var pOn=st('pack')!=='idle';if(pOn){c.fillStyle=rg(c,0,0,10,48,[[0,'rgba(255,153,0,.25)'],[1,'rgba(255,153,0,0)']]);circ(c,0,0,48);c.fill()}
  rr(c,-22,-28,44,56,6);c.fillStyle='#fff';c.fill();c.fillStyle=lg(c,-22,-22,22,0,[[0,'#5a3320'],[1,C.o]]);rr(c,-17,-21,34,16,3);c.fill();
  c.fillStyle='#d5dce4';c.fillRect(-17,0,34,3);c.fillRect(-17,7,26,3);c.fillRect(-17,14,30,3);c.restore();
  tx(c,'tu página',PG.x+38,PG.y+5,{s:12.5,w:700,c:'#fff',al:pk});
  [[PS,'Arch_Amazon-S3_48','Amazon S3','s3'],[PC,'Arch_Amazon-CloudFront_48','CloudFront','cf']].forEach(function(nn){var o=nn[0],s=st(nn[3]),on=s!=='idle';
    if(s==='creating'){var pu=.5+.5*Math.sin(now/250);c.fillStyle=rg(c,o.x,o.y,10,52,[[0,'rgba(255,153,0,'+(.2+.2*pu)+')'],[1,'rgba(255,153,0,0)']]);circ(c,o.x,o.y,52);c.fill()}
    circ(c,o.x,o.y,30);c.fillStyle='#172029';c.fill();c.strokeStyle=s==='done'?C.g2:on?C.o:'#2e3a48';c.lineWidth=2.2;c.stroke();icon(c,nn[1],o.x,o.y,34,on?1:.3);
    if(nn[3]==='s3')tx(c,nn[2],o.x+42,o.y+5,{s:12.5,w:700,c:'#fff',al:on?1:.45});else tx(c,nn[2],o.x,o.y+50,{s:12.5,w:700,c:'#fff',a:'center',al:on?1:.45})});
  // leyenda del paso actual
  var cur=null;DEP.forEach(function(r){if(st(r.k)==='creating')cur=r});var last=null;DEP.forEach(function(r){if(st(r.k)==='done')last=r});
  var show=cur||last;if(show){var d=S.dep[show.k];tx(c,show.n,24,100,{s:17,w:700,f:'display',c:'#fff'});
    tx(c,d.d||(d.st==='done'?'✓ listo':'en curso…'),24,118,{s:12,f:'mono',c:d.st==='done'?C.g2:C.o})}
  else tx(c,'Tu página sale hacia AWS…',24,100,{s:17,w:700,f:'display',c:'#fff'});
  // pasos abajo
  DEP.forEach(function(r,i){var x=24+i*112,s=st(r.k),pu=.5+.5*Math.sin(now/200);
    c.fillStyle=s==='done'?C.g2:s==='creating'?col(C.o,.6+.4*pu):'#34414f';circ(c,x+6,496,5.5);c.fill();
    tx(c,r.c,x+18,500,{s:11,f:'mono',c:s==='idle'?C.dfaint:'#fff'})})}

/* confeti y destello al encenderse */
var CONF=null;function confeti(){var r=U.rng(4),a=[],pal=[C.o,C.p,C.t,C.g2,'#ffd166','#ffffff'];
  for(var i=0;i<190;i++){var an=-Math.PI/2+(r()-.5)*2.4,sp=260+r()*460;a.push({vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,c:pal[i%pal.length],w:4+r()*5,h:2+r()*3,rs:(r()-.5)*14,ph:r()*6,x0:(r()-.5)*60})}return a}
function fxLive(c,now){var el=sec(now-S.liveT);if(el>4.2)return;if(!CONF)CONF=confeti();
  var fl=1-P(el,0,.9);if(fl>0){c.globalCompositeOperation='lighter';c.fillStyle=rg(c,300,300,0,330,[[0,'rgba(255,240,210,'+(.85*fl)+')'],[.5,'rgba(255,153,0,'+(.35*fl)+')'],[1,'rgba(255,153,0,0)']]);c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over'}
  for(var w=0;w<3;w++){var k=P(el,w*.18,1.1);if(k>0&&k<1){c.strokeStyle=col(w===1?C.g2:C.o,(1-k)*.8);c.lineWidth=3*(1-k)+.5;circ(c,300,300,20+320*E.out(k));c.stroke()}}
  var bk=P(el,.15,.55),ex=P(el,1.5,.6);if(bk>0&&ex<1){c.save();c.translate(300,290);var sc=lerp(.4,1,E.back(bk))*(1+.25*ex);c.scale(sc,sc);c.globalAlpha=1-ex;
    glow(c,'rgba(255,153,0,.9)',30);tx(c,'¡ESTÁ VIVO!',0,18,{s:64,w:800,f:'display',c:'#fff',a:'center'});noglow(c);c.restore()}
  CONF.forEach(function(p){var t=el,x=300+p.x0+p.vx*t*.9,y=320+p.vy*t+520*t*t,a=1-P(el,2.6,1.4);if(y>H+20||a<=0)return;
    c.save();c.translate(x,y);c.rotate(p.ph+p.rs*t);c.globalAlpha=a;c.fillStyle=p.c;c.fillRect(-p.w/2,-p.h/2,p.w,p.h*(.4+.6*Math.abs(Math.cos(p.ph+t*6))));c.restore()})}

function frame(now){requestAnimationFrame(frame);if(!slide.classList.contains('on'))return;fit();
  var k=bgc.width/W;[cb,cf].forEach(function(c){c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,bgc.width,bgc.height);c.setTransform(k,0,0,k,0,0);c.lineCap='round';c.lineJoin='round'});
  U.setK(k);renderCode();
  header(cb,now);
  if(S.phase==='idle')escenaProv(cb,now,true);
  else if(S.phase==='prov')escenaProv(cb,now,false);
  else if(S.phase==='ia')escenaIA(cb,now);
  else if(S.phase==='deploy')escenaDeploy(cb,now);
  else if(S.phase==='live'){cb.fillStyle=rg(cb,300,300,40,320,[[0,'rgba(61,208,127,.12)'],[1,'rgba(61,208,127,0)']]);cb.fillRect(0,76,W,H);fxLive(cf,now)}
  else if(S.phase==='failed'){rr(cb,24,180,552,150,16);cb.fillStyle='rgba(229,72,77,.08)';cb.fill();cb.strokeStyle='rgba(229,72,77,.6)';cb.lineWidth=1.4;cb.stroke();
    tx(cb,'⚠  '+(S.err.length>64?S.err.slice(0,62)+'…':S.err),300,236,{s:12,w:600,f:'mono',c:'#ff9b9b',a:'center'});
    tx(cb,'Plan B: el QR de la siguiente diapositiva ya está encendido',300,272,{s:13,f:'mono',c:C.dmuted,a:'center'});
    tx(cb,'«la magia de la nube: esto ya lo dejé encendido antes — ábranlo igual»',300,296,{s:12,f:'mono',c:C.dfaint,a:'center'})}
  if(S.phase!=='live')CONF=null}
window.addEventListener('resize',function(){lastW=0;fit()});
requestAnimationFrame(frame);
})();
