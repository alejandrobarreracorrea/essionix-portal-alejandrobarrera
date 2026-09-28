/* escenas.js — animaciones en canvas de "De tu cabeza al mundo" (AWS UG Pereira)
   Cada <canvas data-escena="nombre"> es una escena: al entrar a su diapositiva
   corre su historia desde t=0 y luego queda viva en bucle. Solo anima la
   diapositiva visible. Respeta prefers-reduced-motion (pinta el estado final). */
(function(){
'use strict';
var DPR=Math.min(2,window.devicePixelRatio||1);
var RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var DEFS={},live=[],raf=0,KS=1;
var D2R=Math.PI/180;
var C={ink:'#151D25',muted:'#5b6b78',faint:'#98a4b0',line:'#e3e6ec',
  p:'#AC5BFF',pd:'#7b2ff5',t:'#41B3FF',td:'#1f7fc4',o:'#FF9900',od:'#e07600',oc:'#c26a12',r:'#ff6a3d',
  g:'#12a15a',g2:'#3DD07F',red:'#e5484d',panel2:'#20303d',dline:'#2e3a48',dmuted:'#aab6c2',dfaint:'#71808e'};
var F={display:'"Plus Jakarta Sans",system-ui,sans-serif',body:'Inter,system-ui,sans-serif',mono:'"JetBrains Mono",ui-monospace,monospace'};

/* ---------- utilidades ---------- */
function clamp(x,a,b){return x<a?a:x>b?b:x}
function P(t,a,d){return clamp((t-a)/d,0,1)}
function lerp(a,b,k){return a+(b-a)*k}
function invIO(f){f=clamp(f,0,1);return f<.5?Math.cbrt(f/4):1-Math.cbrt(2*(1-f))/2}
var E={
  io:function(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},
  out:function(x){return 1-Math.pow(1-x,3)},
  in:function(x){return x*x*x},
  back:function(x){var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)},
  bump:function(x){return x<=0||x>=1?0:Math.sin(Math.PI*x)}
};
function hash(n){n=(n^61)^(n>>>16);n=n+(n<<3);n=n^(n>>>4);n=Math.imul(n,0x27d4eb2d);n=n^(n>>>15);return (n>>>0)/4294967296}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rgb(h){var n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function col(h,a){var c=rgb(h);return'rgba('+c[0]+','+c[1]+','+c[2]+','+(a==null?1:a)+')'}
function mix(h1,h2,k,a){var x=rgb(h1),y=rgb(h2);return'rgba('+Math.round(lerp(x[0],y[0],k))+','+Math.round(lerp(x[1],y[1],k))+','+Math.round(lerp(x[2],y[2],k))+','+(a==null?1:a)+')'}
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,Math.max(0,r),0,Math.PI*2)}
function glow(c,color,b){c.shadowColor=color;c.shadowBlur=b*KS}
function noglow(c){c.shadowBlur=0}
function tx(c,s,x,y,o){o=o||{};c.font=(o.w||400)+' '+(o.s||14)+'px '+F[o.f||'body'];c.fillStyle=o.c||C.ink;
  c.textAlign=o.a||'left';c.textBaseline=o.b||'alphabetic';var ga=c.globalAlpha;if(o.al!=null)c.globalAlpha=ga*o.al;if(o.st){c.strokeStyle=o.st;c.lineWidth=5;c.strokeText(s,x,y)}c.fillText(s,x,y);c.globalAlpha=ga}
function lg(c,x0,y0,x1,y1,stops){var g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach(function(s){g.addColorStop(s[0],s[1])});return g}
function rg(c,x,y,r0,r1,stops){var g=c.createRadialGradient(x,y,r0,x,y,r1);stops.forEach(function(s){g.addColorStop(s[0],s[1])});return g}
function quad(a,b,cp,k){var u=1-k;return[u*u*a[0]+2*u*k*cp[0]+k*k*b[0],u*u*a[1]+2*u*k*cp[1]+k*k*b[1]]}
function nf(n){return Math.round(n).toLocaleString('es-CO')}

var IM={};
['Arch_Amazon-Bedrock_48','Arch_Amazon-S3_48','Arch_Amazon-CloudFront_48','Arch_AWS-Identity-and-Access-Management_48','Res_Internet_48_Dark'].forEach(function(n){var i=new Image();i.src='assets/aws/'+n+'.svg';IM[n]=i});
function icon(c,n,x,y,s,a){var im=IM[n];if(!im||!im.complete||!im.naturalWidth)return;var ga=c.globalAlpha;c.globalAlpha=ga*(a==null?1:a);
  c.save();rr(c,x-s/2,y-s/2,s,s,s*.18);c.clip();c.drawImage(im,x-s/2,y-s/2,s,s);c.restore();c.globalAlpha=ga}

/* ---------- geografía (continentes aproximados, lon/lat) ---------- */
var LAND=[
 [[-168,65],[-140,70],[-110,72],[-85,70],[-78,62],[-65,60],[-55,51],[-67,45],[-70,42],[-75,37],[-81,31],[-80,25],[-83,29],[-90,30],[-97,27],[-97,21],[-91,19],[-87,21],[-88,16],[-83,10],[-79,9],[-77.5,8],[-80,7],[-85,11],[-92,14.5],[-105,20],[-110,24],[-112,30],[-117,33],[-121,36],[-124,40],[-125,48],[-133,56],[-148,60],[-165,61]],
 [[-120,70],[-80,72],[-65,80],[-90,82],[-120,77]],
 [[-50,60],[-42,60],[-20,70],[-20,80],[-60,82],[-70,76],[-55,68]],
 [[-24,64],[-13,65],[-15,66.5],[-22,66.4]],
 [[-84.9,21.9],[-80,23.1],[-74.2,20.2],[-77.5,19.9],[-82,21.5]],
 [[-74.4,19.8],[-68.4,18.6],[-71,17.6],[-74.4,18.4]],
 [[-77.5,8],[-72,12],[-62,10.5],[-51,4],[-50,0],[-35,-6],[-38,-13],[-40,-22],[-48,-26],[-53,-34],[-58,-38],[-65,-42],[-68,-52],[-72,-50],[-74,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0],[-77,4]],
 [[-10,36],[-9,43],[-2,44],[-4.5,48],[2,51],[8,54],[10,58],[5,62],[15,69],[28,71],[40,67],[40,60],[30,55],[40,48],[28,45],[26,40],[20,40],[16,38],[12,44],[8,44],[3,43],[-2,37]],
 [[-5,50],[1,51],[0,54],[-3,58],[-6,57],[-5,54],[-3,52]],
 [[-17,15],[-17,21],[-13,28],[-6,35],[10,37],[20,32],[32,31],[35,28],[43,12],[51,12],[42,-2],[40,-15],[35,-24],[27,-34],[18,-34],[12,-18],[13,-6],[9,4],[-5,5],[-12,7]],
 [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
 [[26,40],[36,36],[35,31],[44,13],[55,17],[57,24],[62,25],[67,24],[73,20],[77,8],[80,15],[88,22],[92,22],[98,16],[100,6],[104,1],[106,10],[109,12],[108,20],[117,23],[122,31],[119,38],[122,40],[129,35],[130,43],[140,48],[142,54],[135,55],[155,59],[163,60],[180,66],[180,71],[140,73],[110,77],[80,73],[70,68],[55,68],[45,66],[40,67],[40,60],[30,55],[40,48],[48,42],[50,37],[40,40]],
 [[130,31],[135,34],[140,36],[142,40],[141,45],[145,44],[140,41],[139,35],[132,33]],
 [[120,18],[122,18],[126,7],[122,7],[120,13]],
 [[95,5],[105,-6],[115,-8],[125,-9],[120,-2],[118,5],[110,2],[100,2]],
 [[109,1],[117,7],[119,1],[116,-4],[110,-3]],
 [[131,-1],[141,-2.5],[150,-10],[143,-9],[138,-8],[132,-4]],
 [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[151,-34],[146,-39],[138,-35],[132,-32],[115,-35],[113,-26]],
 [[172,-34],[178,-38],[174,-41],[167,-46],[171,-44]]
];
function inPoly(lon,lat,poly){var ins=false;for(var i=0,j=poly.length-1;i<poly.length;j=i++){var xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];
  if(((yi>lat)!==(yj>lat))&&(lon<(xj-xi)*(lat-yi)/(yj-yi)+xi))ins=!ins}return ins}
function isLand(lon,lat){for(var k=0;k<LAND.length;k++)if(inPoly(lon,lat,LAND[k]))return true;return false}
function ll2v(lat,lon){var p=lat*D2R,l=lon*D2R;return[Math.cos(p)*Math.sin(l),Math.sin(p),Math.cos(p)*Math.cos(l)]}
function rot(v,l0,p0){var cl=Math.cos(l0),sl=Math.sin(l0),cp=Math.cos(p0),sp=Math.sin(p0);
  var x=v[0]*cl-v[2]*sl,z=v[0]*sl+v[2]*cl;return[x,v[1]*cp-z*sp,v[1]*sp+z*cp]}
function dot3(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}

/* ---------- motor ---------- */
function def(name,spec){DEFS[name]=spec}
function mount(cv){var d=DEFS[cv.dataset.escena];if(!d)return null;var st={cv:cv,c:cv.getContext('2d'),d:d};cv.__esc=st;return st}
function fit(st){var cv=st.cv,d=st.d,box=cv.parentElement;
  if(d.fill){var w=box.clientWidth,h=box.clientHeight;cv.style.width=w+'px';cv.style.height=h+'px';
    cv.width=Math.max(1,Math.round(w*DPR));cv.height=Math.max(1,Math.round(h*DPR));st.W=w;st.H=h;st.k=DPR;return}
  var bw=box.clientWidth||d.w,mh=(parseFloat(cv.dataset.maxh)||.66)*innerHeight;
  var cw=Math.min(bw,mh*d.w/d.h),ch=cw*d.h/d.w;
  cv.style.width=cw+'px';cv.style.height=ch+'px';cv.width=Math.round(cw*DPR);cv.height=Math.round(ch*DPR);
  st.W=d.w;st.H=d.h;st.k=cv.width/d.w}
var TOFF=parseFloat((location.search.match(/[?&]t=([\d.]+)/)||[])[1])||0;   // depuración: ?t=5 muestra cada escena en su segundo 5
function paint(st,now){var c=st.c,t=RM?(st.d.rest||30):(now-st.t0)/1000+TOFF;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,st.cv.width,st.cv.height);
  c.setTransform(st.k,0,0,st.k,0,0);KS=st.k;c.globalAlpha=1;c.globalCompositeOperation='source-over';c.shadowBlur=0;c.lineCap='round';c.lineJoin='round';
  st.S.W=st.W;st.S.H=st.H;st.d.draw(c,st.S,t)}
function frame(now){raf=0;live.forEach(function(st){paint(st,now)});if(live.length&&!RM)raf=requestAnimationFrame(frame)}
function counts(slide){slide.querySelectorAll('[data-count]').forEach(function(el){
  var to=+el.dataset.count,from=+(el.dataset.from||0),fmt=el.dataset.fmt||'{n}',dur=+(el.dataset.dur||1.8),delay=+(el.dataset.delay||.25),t0=performance.now();
  function put(v){el.textContent=fmt.replace('{n}',nf(v))}
  if(RM){put(to);return}put(from);
  (function step(now){var k=E.out(clamp(((now-t0)/1000-delay)/dur,0,1));put(lerp(from,to,k));
    if(k<1&&slide.classList.contains('on'))requestAnimationFrame(step);else put(to)})(t0)})}
function enter(slide){live=[];
  slide.querySelectorAll('canvas[data-escena]').forEach(function(cv){var st=cv.__esc||mount(cv);if(!st)return;
    fit(st);st.S={W:st.W,H:st.H};if(st.d.prep)st.d.prep();if(st.d.init)st.d.init(st.S);st.t0=performance.now();live.push(st)});
  counts(slide);
  if(live.length){if(RM)frame(performance.now());else if(!raf)raf=requestAnimationFrame(frame)}}
window.addEventListener('resize',function(){live.forEach(fit)});
window.Escenas={def:def,enter:enter};

/* =====================================================================
   PORTADA / CIERRE · la rejilla modular se enciende como ventanas
   ===================================================================== */
def('rejilla',{fill:true,rest:3,draw:function(c,S,t){
  var cols=5,rows=6,cw=S.W/cols,ch=S.H/rows,pal=[C.p,C.t,C.o];
  for(var i=0;i<cols;i++)for(var j=0;j<rows;j++){
    var id=i*rows+j,h1=hash(id*7+3),h2=hash(id*13+1),h3=hash(id*31+5);
    var k=(i+(rows-1-j))/(cols+rows-2);                       // ola desde abajo-izquierda
    var intro=E.bump(P(t,.15+k*1.3,1.1));
    var per=6+h1*7,amb=Math.pow(Math.max(0,Math.sin(2*Math.PI*(t/per+h2))),8);
    var a=Math.max(intro*.55,amb*.38);if(a<.01)continue;
    var colr=pal[Math.floor(h3*3)];
    c.fillStyle=col(colr,a*.2);c.fillRect(i*cw+1,j*ch+1,cw-2,ch-2);
    c.strokeStyle=col(colr,a*.55);c.lineWidth=1.2;c.strokeRect(i*cw+.5,j*ch+.5,cw-1,ch-1);
    if(a>.3){c.fillStyle=col(colr,(a-.3)*.9);circ(c,i*cw+cw/2,j*ch+ch/2,2.2);c.fill()}
  }}});

/* =====================================================================
   2 · COLD OPEN · el planeta se enciende desde Pereira
   ===================================================================== */
var PER=ll2v(4.81,-75.69);
var CITIES=[[40.7,-74,0],[19.4,-99.1,1],[-23.5,-46.6,1],[51.5,-.1,0],[37.8,-122.4,0],[-34.6,-58.4,1],[-12,-77,1],[40.4,-3.7,0],
  [25.8,-80.2,0],[-33.4,-70.6,1],[6.5,3.4,0],[43.7,-79.4,0],[35.7,139.7,0],[10.5,-66.9,1],[52.5,13.4,0],[-33.9,18.4,0],
  [9,-79.5,1],[41.9,-87.6,0],[19,72.8,0],[-.2,-78.5,1],[34,-118.2,0],[-33.9,151.2,0],[23.1,-82.4,1],[-34.9,-56.2,1]];
def('mundo',{w:520,h:520,rest:9,
  prep:function(){if(this.pts)return;var pts=[],N=12000,ga=Math.PI*(3-Math.sqrt(5));
    for(var i=0;i<N;i++){var y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),th=ga*i,x=Math.cos(th)*r,z=Math.sin(th)*r;
      var lat=Math.asin(y)/D2R,lon=Math.atan2(x,z)/D2R;
      if(isLand(lon,lat)){var v=[x,y,z];pts.push({v:v,dp:dot3(v,PER),la:(lon>-118&&lon<-34&&lat<32.5)})}}
    this.pts=pts;
    this.arcs=CITIES.map(function(cc){var B=ll2v(cc[0],cc[1]);return{B:B,om:Math.acos(clamp(dot3(PER,B),-1,1)),la:cc[2]}})},
  draw:function(c,S,t){
    var cx=260,cy=262,R=204,l0=(-55-20*Math.cos(t*.1))*D2R,p0=10*D2R,d=this;
    var fade=E.out(P(t,0,.8));
    c.globalCompositeOperation='lighter';
    c.fillStyle=rg(c,cx,cy,R*.7,R*1.32,[[0,'rgba(172,91,255,.16)'],[1,'rgba(172,91,255,0)']]);c.fillRect(0,0,520,520);
    c.globalCompositeOperation='source-over';c.globalAlpha=fade;
    c.fillStyle=rg(c,cx-R*.35,cy-R*.42,R*.1,R*1.05,[[0,'#243240'],[1,'#0f151c']]);circ(c,cx,cy,R);c.fill();
    c.strokeStyle='rgba(65,179,255,.28)';c.lineWidth=1.2;c.stroke();
    // tierra: se revela como una onda que nace en Pereira
    var rv=E.io(P(t,.3,2.3)),th=Math.cos(rv*Math.PI),lk=E.io(P(t,3.3,1.4));
    for(var i=0;i<d.pts.length;i++){var p=d.pts[i];if(p.dp<th)continue;var q=rot(p.v,l0,p0);if(q[2]<=0)continue;
      var X=cx+R*q[0],Y=cy-R*q[1],s=.65+.85*q[2],a=.16+.7*q[2];
      var front=rv<1?clamp(1-(p.dp-th)/.07,0,1):0;
      if(p.la&&lk>0){c.fillStyle=mix('#aab6c2',C.o,lk,a*(.7+.3*lk)+front*.5)}
      else c.fillStyle=front>0?'rgba(255,255,255,'+(a*.6+front*.4)+')':'rgba(170,182,194,'+a+')';
      c.fillRect(X-s,Y-s,s*2,s*2)}
    c.globalAlpha=1;
    // arcos: tu idea sale de Pereira hacia el mundo
    c.globalCompositeOperation='lighter';
    d.arcs.forEach(function(ar,i){var T=1.5+i*.17;if(t<T)return;var lt=(t-T)%6.2;
      var head=E.out(P(lt,0,1.4)),tail=E.io(P(lt,.75,1.25)),colr=ar.la?C.o:C.t,so=Math.sin(ar.om);
      function pt(s){var k1=Math.sin((1-s)*ar.om)/so,k2=Math.sin(s*ar.om)/so,h=1+Math.min(.16,.05+.2*ar.om/Math.PI)*Math.sin(Math.PI*s);
        return rot([(PER[0]*k1+ar.B[0]*k2)*h,(PER[1]*k1+ar.B[1]*k2)*h,(PER[2]*k1+ar.B[2]*k2)*h],l0,p0)}
      function vis(q){return q[2]>-.02}
      if(head>tail){var n=28,prev=null;c.lineWidth=1.7;
        for(var k=0;k<=n;k++){var s=tail+(head-tail)*k/n,q=pt(s);
          if(prev&&vis(q)&&vis(prev)){c.strokeStyle=col(colr,.1+.8*k/n);c.beginPath();c.moveTo(cx+R*prev[0],cy-R*prev[1]);c.lineTo(cx+R*q[0],cy-R*q[1]);c.stroke()}
          prev=q}
        if(head<1){var qh=pt(head);if(vis(qh)){c.fillStyle=rg(c,cx+R*qh[0],cy-R*qh[1],0,9,[[0,'rgba(255,255,255,.95)'],[.3,col(colr,.8)],[1,col(colr,0)]]);circ(c,cx+R*qh[0],cy-R*qh[1],9);c.fill()}}}
      var rk=P(lt,1.35,1.3);if(rk>0&&rk<1){var qb=rot(ar.B,l0,p0);if(qb[2]>0){c.strokeStyle=col(colr,(1-rk)*.9);c.lineWidth=1.4;circ(c,cx+R*qb[0],cy-R*qb[1],2+13*E.out(rk));c.stroke()}}});
    // Pereira
    var qp=rot(PER,l0,p0);if(qp[2]>0&&t>.25){var X=cx+R*qp[0],Y=cy-R*qp[1],ig=E.back(P(t,.25,.6));
      c.fillStyle=rg(c,X,Y,0,26*ig,[[0,'rgba(255,200,120,.9)'],[.35,'rgba(255,153,0,.45)'],[1,'rgba(255,153,0,0)']]);circ(c,X,Y,26*ig);c.fill();
      for(var w=0;w<2;w++){var wk=((t+w)%2)/2;c.strokeStyle=col(C.o,(1-wk)*.8);c.lineWidth=1.6;circ(c,X,Y,5+30*wk);c.stroke()}
      c.globalCompositeOperation='source-over';c.fillStyle='#fff';circ(c,X,Y,3.2*ig);c.fill();
      tx(c,'Pereira',X+10,Y-9,{s:12,w:700,c:'#ffd9a0',al:P(t,.6,.6)})}
    c.globalCompositeOperation='source-over';
    // etiqueta LATAM que viaja con el globo
    var ql=rot(ll2v(-16,-60),l0,p0),la=P(t,3.9,.8)*(ql[2]>.2?1:0);
    if(la>0){var X2=cx+R*ql[0],Y2=cy-R*ql[1];c.globalAlpha=la;rr(c,X2-62,Y2-14,124,28,14);c.fillStyle='rgba(21,29,37,.82)';c.fill();
      c.strokeStyle=col(C.o,.7);c.lineWidth=1.3;c.stroke();tx(c,'LATAM · +400 M',X2,Y2+4.5,{s:12.5,w:700,c:C.o,a:'center'});c.globalAlpha=1}
  }});

/* =====================================================================
   4 · AGENDA · una chispa recorre el camino y enciende cada parada
   ===================================================================== */
def('agenda',{w:380,h:400,rest:6,draw:function(c,S,t){
  var X=56,Y0=56,Y1=344,stops=[
    {y:56,t1:'Entender la nube',t2:'5 ideas, sin jerga',ic:'bulb'},
    {y:152,t1:'Por qué AWS, ahora',t2:'el momento es hoy',ic:'trend'},
    {y:248,t1:'Demo en vivo',t2:'encendemos una idea',ic:'play',hot:1},
    {y:344,t1:'Tu turno',t2:'enciende las tuyas',ic:'star'}];
  var fp=E.io(P(t,.2,2.6)),yf=Y0+(Y1-Y0)*fp;
  c.strokeStyle='#e3e6ec';c.lineWidth=4;c.beginPath();c.moveTo(X,Y0);c.lineTo(X,Y1);c.stroke();
  c.strokeStyle=lg(c,0,Y0,0,Y1,[[0,C.pd],[1,C.td]]);c.beginPath();c.moveTo(X,Y0);c.lineTo(X,yf);c.stroke();
  if(fp<1){glow(c,C.o,14);c.fillStyle=C.o;circ(c,X,yf,6);c.fill();noglow(c)}
  // chispa en bucle
  var sy=null;if(t>3.2){var lk=((t-3.2)%3.4)/3.4;sy=Y0+(Y1-Y0)*E.io(lk);
    c.strokeStyle=lg(c,0,sy-50,0,sy,[[0,'rgba(255,153,0,0)'],[1,'rgba(255,153,0,.9)']]);c.lineWidth=4;c.beginPath();c.moveTo(X,Math.max(Y0,sy-50));c.lineTo(X,sy);c.stroke();
    glow(c,C.o,12);c.fillStyle=C.o;circ(c,X,sy,5.5);c.fill();noglow(c)}
  stops.forEach(function(s,i){
    var tr=.2+2.6*invIO((s.y-Y0)/(Y1-Y0)),k=P(t,tr,.5),R=s.hot?26:22;
    var near=sy!=null?clamp(1-Math.abs(sy-s.y)/30,0,1):0;
    if(s.hot&&k>0){var pk=(t%1.8)/1.8;c.strokeStyle=col(C.o,(1-pk)*.6);c.lineWidth=2;circ(c,X,s.y,R+4+16*pk);c.stroke()}
    if(near>0){c.strokeStyle=col(s.hot?C.o:C.pd,near*.5);c.lineWidth=2;circ(c,X,s.y,R+6+8*near);c.stroke()}
    var sc=k>0?E.back(k):0;
    c.save();c.translate(X,s.y);c.scale(.6+.4*sc||.6,.6+.4*sc||.6);
    c.fillStyle='#fff';circ(c,0,0,R);c.fill();
    c.strokeStyle=k>0?(s.hot?lg(c,-R,-R,R,R,[[0,C.o],[1,C.r]]):lg(c,-R,-R,R,R,[[0,C.pd],[1,C.td]])):'#d6dce4';c.lineWidth=s.hot?3.4:3;c.stroke();
    if(s.hot&&k>0){glow(c,'rgba(255,153,0,.6)',16);c.stroke();noglow(c)}
    var ic=k>0?(s.hot?C.od:C.pd):'#c3cbd5';c.strokeStyle=ic;c.fillStyle=ic;c.lineWidth=2.4;
    if(s.ic==='bulb'){circ(c,0,-3,7);c.stroke();c.beginPath();c.moveTo(-4,9);c.lineTo(4,9);c.moveTo(-2,13);c.lineTo(2,13);c.stroke()}
    if(s.ic==='trend'){var dp=k;c.beginPath();c.moveTo(-10,7);c.lineTo(-3,-2);c.lineTo(3,3);c.lineTo(10,-7);c.stroke();if(dp>0){c.beginPath();c.moveTo(4,-8);c.lineTo(11,-8);c.lineTo(11,-1);c.stroke()}}
    if(s.ic==='play'){c.beginPath();c.moveTo(-7,-11);c.lineTo(15,0);c.lineTo(-7,11);c.closePath();c.fill()}
    if(s.ic==='star'){c.beginPath();c.moveTo(0,-9);c.lineTo(2.6,-2.6);c.lineTo(9,0);c.lineTo(2.6,2.6);c.lineTo(0,9);c.lineTo(-2.6,2.6);c.lineTo(-9,0);c.lineTo(-2.6,-2.6);c.closePath();c.fill()}
    c.restore();
    var ta=E.out(P(t,tr+.1,.5)),ox=(1-ta)*-14,xx=(s.hot?96:92)+ox;
    tx(c,s.t1,xx,s.y-6,{s:s.hot?21:20,w:700,f:'display',c:C.ink,al:ta});
    tx(c,s.t2,xx,s.y+17,{s:14,w:s.hot?600:400,c:s.hot?C.oc:C.muted,al:ta});
  })}});

/* =====================================================================
   5 · PAGAS SOLO LO QUE ENCIENDES · un día de consumo vs "por si acaso"
   ===================================================================== */
function uso(h){function g(x,m,s){return Math.exp(-(x-m)*(x-m)/(2*s*s))}return Math.min(.72,.04+.12*g(h,8,1.5)+.44*g(h,12.5,2.4)+.66*g(h,19.5,1.8))}
def('consumo',{w:380,h:290,rest:8,draw:function(c,S,t){
  var x0=44,x1=364,yb=214,yt=64,H=yb-yt;function hx(h){return x0+(x1-x0)*h/24}function uy(u){return yb-H*u}
  // eje y horas
  var ax=E.io(P(t,.2,.8));c.strokeStyle='#c9d2dc';c.lineWidth=2;c.beginPath();c.moveTo(x0,yb);c.lineTo(lerp(x0,x1,ax),yb);c.stroke();
  [0,6,12,18,24].forEach(function(h,i){tx(c,h+'h',hx(h),yb+18,{s:11,f:'mono',c:C.faint,a:'center',al:P(t,.4+i*.08,.3)})});
  // bloque "por si acaso"
  var bk=E.out(P(t,1,.9));if(bk>0){var top=lerp(yb,yt,bk);
    c.save();rr(c,x0,top,x1-x0,yb-top,8);c.fillStyle='#f1f4f8';c.fill();c.clip();c.strokeStyle='#dfe5ec';c.lineWidth=1.2;
    for(var k=-H;k<x1-x0;k+=10){c.beginPath();c.moveTo(x0+k,yb);c.lineTo(x0+k+H,yb-H);c.stroke()}c.restore();
    c.strokeStyle='#cfd7e1';c.lineWidth=1.4;c.setLineDash([5,5]);rr(c,x0,top,x1-x0,yb-top,8);c.stroke();c.setLineDash([]);
    var la=P(t,1.6,.5);tx(c,'servidor comprado “por si acaso”',x0+12,yt+20,{s:12,w:600,c:C.muted,al:la});
    tx(c,'USD 10.000 · prendido 24/7',x0+12,yt+37,{s:11,f:'mono',c:C.faint,al:la})}
  // consumo real: el cabezal recorre el día
  var first=P(t,2.2,2.8),loop=t>5.4?((t-5.4)%6)/6:null,hh=24*E.io(first);
  if(first>0){c.beginPath();c.moveTo(x0,yb);for(var h=0;h<=hh;h+=.2)c.lineTo(hx(h),uy(uso(h)));c.lineTo(hx(hh),uy(uso(hh)));c.lineTo(hx(hh),yb);c.closePath();
    c.fillStyle=lg(c,0,yt,0,yb,[[0,'rgba(255,153,0,.55)'],[1,'rgba(255,106,61,.18)']]);c.fill();
    c.beginPath();for(h=0;h<=hh;h+=.2)(h===0?c.moveTo:c.lineTo).call(c,hx(h),uy(uso(h)));c.strokeStyle=C.od;c.lineWidth=2.6;glow(c,'rgba(255,153,0,.5)',8);c.stroke();noglow(c)}
  var ph=loop!=null?24*loop:(first<1?hh:null);
  if(ph!=null){var px=hx(ph),py=uy(uso(ph));c.strokeStyle='rgba(21,29,37,.25)';c.lineWidth=1.2;c.setLineDash([3,4]);c.beginPath();c.moveTo(px,yt-6);c.lineTo(px,yb);c.stroke();c.setLineDash([]);
    glow(c,C.o,12);c.fillStyle=C.o;circ(c,px,py,5);c.fill();noglow(c);c.fillStyle='#fff';circ(c,px,py,2);c.fill()}
  var pa=P(t,5,.6);tx(c,'pagas solo esto',hx(12.4),yb-14,{s:13,w:700,f:'display',c:C.oc,a:'center',al:pa});
  // bombillo de cabecera: brilla según el consumo del momento
  var lvl=ph!=null?uso(ph):0,bx=24,by=26;
  if(lvl>0){c.fillStyle=rg(c,bx,by,0,22,[[0,col(C.o,.55*lvl)],[1,col(C.o,0)]]);circ(c,bx,by,22);c.fill()}
  c.fillStyle=mix('#e3e6ec','#ffcc66',lvl);c.strokeStyle=mix('#b7c0cb',C.od,lvl);c.lineWidth=1.8;circ(c,bx,by-2,8);c.fill();c.stroke();
  c.beginPath();c.moveTo(bx-4,by+9);c.lineTo(bx+4,by+9);c.moveTo(bx-2.5,by+12.5);c.lineTo(bx+2.5,by+12.5);c.stroke();
  tx(c,'tu idea durante un día',42,31,{s:15,w:700,f:'display',c:C.ink});
  if(ph!=null)tx(c,Math.floor(ph).toString().padStart(2,'0')+':00 · '+(lvl<.12?'casi apagada':lvl<.45?'encendida':'a tope'),364,31,{s:11,f:'mono',c:lvl<.15?C.faint:C.oc,a:'right'});
  // leyenda
  var lg2=P(t,5.3,.6);c.globalAlpha=lg2;
  rr(c,44,258,14,14,3);c.fillStyle='rgba(255,153,0,.55)';c.fill();tx(c,'lo que pagas en la nube',64,270,{s:12,c:C.ink});
  rr(c,200,258,14,14,3);c.fillStyle='#f1f4f8';c.fill();c.strokeStyle='#cfd7e1';c.lineWidth=1.2;c.stroke();tx(c,'lo que pagarías comprando',220,270,{s:12,c:C.muted});
  c.globalAlpha=1}});

/* =====================================================================
   6 · REGIONES · mapa de puntos, 39 regiones que aparecen una a una
   ===================================================================== */
var REG=[['N. Virginia',-77.5,39],['Ohio',-83,40],['N. California',-122,37.5],['Oregón',-120,45.5],['Montreal',-73.6,45.5],['Calgary',-114,51],
 ['México',-100.4,20.6,1],['São Paulo',-46.6,-23.5,1],['Irlanda',-6.3,53.3],['Londres',-.1,51.5],['París',2.35,48.9],['Frankfurt',8.7,50.1],['Zúrich',8.5,47.4],
 ['Milán',9.2,45.5],['España',-.9,41.6],['Estocolmo',18,59.3],['Baréin',50.6,26],['EAU',54.4,24.5],['Tel Aviv',34.8,32],['Ciudad del Cabo',18.4,-33.9],
 ['Hong Kong',114.2,22.3],['Taipéi',121.5,25],['Mumbai',72.9,19],['Hyderabad',78.5,17.4],['Singapur',103.8,1.35],['Sídney',151.2,-33.9],['Yakarta',106.8,-6.2],
 ['Melbourne',145,-37.8],['Malasia',101.7,3.1],['Tailandia',100.5,13.75],['Tokio',139.7,35.7],['Seúl',127,37.5],['Osaka',135.5,34.7],['Pekín',116.4,39.9],
 ['Ningxia',106.3,38.5],['GovCloud Oeste',-117,43.6],['GovCloud Este',-80.5,41.3],['Nueva Zelanda',174.8,-36.8],['Brandeburgo',13,52.4]];
function mp(lon,lat){return[10+(lon+170)/350*540,40+(78-lat)/134*260]}
def('regiones',{w:560,h:330,rest:10,
  prep:function(){if(this.dots)return;var dots=[];
    for(var y=46;y<=298;y+=5)for(var x=12;x<=552;x+=5){var lon=-170+(x-10)/540*350,lat=78-(y-40)/260*134;if(isLand(lon,lat))dots.push([x,y])}
    this.dots=dots;var r=rng(11);this.reg=REG.map(function(g){var p=mp(g[1],g[2]);return{n:g[0],x:p[0],y:p[1],la:!!g[3],o:r()}});
    var ord=this.reg.slice().sort(function(a,b){return a.o-b.o});ord.forEach(function(g,i){g.T=1.1+i*.075});
    function R(n){return this.reg.filter(function(g){return g.n===n})[0]}
    var bog=mp(-74.1,4.7);this.bog={x:bog[0],y:bog[1]};var s=this;
    this.links=[['bog','N. Virginia'],['bog','México'],['bog','São Paulo'],['N. Virginia','Frankfurt'],['Frankfurt','Mumbai'],['Mumbai','Singapur'],['Singapur','Tokio'],['Singapur','Sídney'],['N. Virginia','Oregón']]
      .map(function(l){return l.map(function(n){return n==='bog'?s.bog:R.call(s,n)})})},
  draw:function(c,S,t){var d=this;
    var sx=E.io(P(t,0,1.3))*620;
    c.fillStyle='#d3dbe4';
    for(var i=0;i<d.dots.length;i++){var p=d.dots[i];if(p[0]>sx)continue;var a=clamp((sx-p[0])/50,0,1);c.globalAlpha=a;c.fillRect(p[0]-1.3,p[1]-1.3,2.6,2.6)}
    c.globalAlpha=1;
    // tráfico entre regiones
    var ta=P(t,4,.8);if(ta>0){d.links.forEach(function(l,i){var A=[l[0].x,l[0].y],B=[l[1].x,l[1].y],dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy),
        cp=[(A[0]+B[0])/2,(A[1]+B[1])/2-len*.28];var hot=l[0]===d.bog;
        c.strokeStyle=col(hot?C.o:C.pd,.28*ta);c.lineWidth=1.3;c.setLineDash([3,4]);c.beginPath();c.moveTo(A[0],A[1]);c.quadraticCurveTo(cp[0],cp[1],B[0],B[1]);c.stroke();c.setLineDash([]);
        var ph=((t-4)*.32+i*.23)%1;for(var k=0;k<6;k++){var q=quad(A,B,cp,clamp(ph-k*.012,0,1));c.fillStyle=col(hot?C.o:C.pd,ta*(1-k/6)*.9);circ(c,q[0],q[1],2.8-k*.3);c.fill()}})}
    // regiones
    var n=0;d.reg.forEach(function(g){if(t<g.T)return;n++;var k=P(t,g.T,.5),s=E.back(k),k2=P(t,g.T,1.1);
      var colr=g.la?C.o:mix(C.pd,C.td,g.x/560);
      if(k2<1){c.strokeStyle=g.la?col(C.o,(1-k2)*.7):'rgba(123,47,245,'+(1-k2)*.5+')';c.lineWidth=1.4;circ(c,g.x,g.y,3+13*E.out(k2));c.stroke()}
      c.fillStyle=colr;circ(c,g.x,g.y,(g.la?4.6:3.6)*s);c.fill()});
    // Bogotá Local Zone
    var bk=P(t,4.3,.6);if(bk>0){var b=d.bog;for(var w=0;w<2;w++){var wk=((t+w*.9)%1.8)/1.8;c.strokeStyle=col(C.o,(1-wk)*.8*bk);c.lineWidth=1.8;circ(c,b.x,b.y,6+16*wk);c.stroke()}
      glow(c,'rgba(255,153,0,.7)',10);c.fillStyle=C.o;circ(c,b.x,b.y,6*E.back(bk));c.fill();noglow(c);c.fillStyle='#fff';circ(c,b.x,b.y,2.2*bk);c.fill();
      tx(c,'Bogotá',b.x-12,b.y+1,{s:12.5,w:700,c:C.oc,a:'right',al:bk});tx(c,'Local Zone',b.x-12,b.y+14,{s:10.5,f:'mono',c:C.muted,a:'right',al:bk})}
    // etiquetas
    var la=P(t,4.1,.6);if(la>0){[['N. Virginia',0,-9,'center'],['Frankfurt',0,-9,'center'],['Tokio',0,-9,'center'],['Sídney',0,17,'center'],['México',-9,4,'right'],['São Paulo',9,4,'left']].forEach(function(L){
      var g=d.reg.filter(function(r){return r.n===L[0]})[0];tx(c,L[0],g.x+L[1],g.y+L[2],{s:12,w:g.la?700:600,c:g.la?C.oc:C.ink,a:L[3],al:la})})}
    // contador
    tx(c,String(n),18,286,{s:46,w:800,f:'display',c:C.o});
    var nw=n>=10?58:32;tx(c,'regiones',18+nw+8,270,{s:15,w:700,c:C.ink});tx(c,'en el mundo',18+nw+8,287,{s:12.5,c:C.muted});
    // puntos de entrega de CloudFront: donde llega tu idea
    var ek=P(t,5.4,1.6);if(ek>0){for(var q=0;q<d.dots.length;q++){if(hash(q*29+7)<.955)continue;var dp=d.dots[q],ph=hash(q*3+1);if(ph>ek)continue;
        var tw=.55+.45*Math.sin(t*3+q);c.fillStyle=col(C.o,.85*tw);c.beginPath();c.moveTo(dp[0],dp[1]-3);c.lineTo(dp[0]+3,dp[1]);c.lineTo(dp[0],dp[1]+3);c.lineTo(dp[0]-3,dp[1]);c.closePath();c.fill()}}
    var f1=P(t,4.6,.6)*(1-P(t,5.2,.3)),f2=P(t,5.5,.5);
    tx(c,'2 en LATAM (México · São Paulo) + Local Zone en Bogotá = menor latencia',280,322,{s:12.5,c:C.muted,a:'center',al:f1});
    tx(c,'◆ 600+ puntos de CloudFront: desde donde tu idea llega a cada persona',280,322,{s:12.5,w:600,c:C.oc,a:'center',al:f2});
  }});

/* =====================================================================
   7 · RESPONSABILIDAD COMPARTIDA · el escudo aguanta; tu puerta abierta, no
   ===================================================================== */
function amenaza(c,x,y,a,rot0){c.save();c.translate(x,y);c.rotate(rot0);c.globalAlpha*=a;glow(c,'rgba(229,72,77,.7)',10);c.fillStyle=C.red;c.beginPath();
  for(var i=0;i<16;i++){var r=i%2?3.4:7.5,an=i*Math.PI/8;c.lineTo(Math.cos(an)*r,Math.sin(an)*r)}c.closePath();c.fill();noglow(c);c.restore()}
function chispas(c,x,y,k,colr,n){for(var i=0;i<(n||9);i++){var an=i/(n||9)*Math.PI*2+.3,r=4+20*E.out(k);c.fillStyle=col(colr,1-k);circ(c,x+Math.cos(an)*r,y+Math.sin(an)*r,2*(1-k)+.4);c.fill()}}
function disparo(c,t,T,A,B,Bk,sp){if(t<T||t>T+1.6)return 0;var k1=P(t,T,.8);
  if(k1<1){var e=E.in(k1),x=lerp(A[0],B[0],e),y=lerp(A[1],B[1],e);for(var j=1;j<5;j++){var e2=E.in(clamp(k1-j*.04,0,1));c.fillStyle=col(C.red,.18*(1-j/5));circ(c,lerp(A[0],B[0],e2),lerp(A[1],B[1],e2),6-j);c.fill()}
    amenaza(c,x,y,1,t*6);return 0}
  var k2=P(t,T+.8,.7);chispas(c,B[0],B[1],k2,sp);amenaza(c,lerp(B[0],Bk[0],E.out(k2)),lerp(B[1],Bk[1],E.out(k2)),1-k2,t*6);return 1-k2}
def('responsabilidad',{w:380,h:360,rest:12,draw:function(c,S,t){
  tx(c,'responsabilidad compartida',190,18,{s:12.5,f:'mono',c:C.muted,a:'center'});
  // --- capa AWS ---
  var pa=E.out(P(t,0,.5));c.globalAlpha=pa;rr(c,12,30,356,152,16);c.fillStyle='rgba(124,60,237,.05)';c.fill();c.strokeStyle='rgba(123,47,245,.45)';c.lineWidth=1.6;c.stroke();c.globalAlpha=1;
  for(var r=0;r<3;r++){var rk=E.back(P(t,.2+r*.18,.6)),hgt=78*rk,x=40+r*38,yb=164;if(hgt<=0)continue;
    rr(c,x,yb-hgt,30,hgt,4);c.fillStyle='#fff';c.fill();c.strokeStyle='rgba(123,47,245,.75)';c.lineWidth=1.8;c.stroke();
    for(var s=0;s<5;s++){var sy=yb-hgt+10+s*14;if(sy>yb-6)break;c.strokeStyle='#e6defa';c.lineWidth=1.2;c.beginPath();c.moveTo(x+5,sy+5);c.lineTo(x+18,sy+5);c.stroke();
      var on=Math.sin(t*(2+hash(r*9+s)*4)+hash(s*5+r)*9)>.1;c.fillStyle=on?(s%2?C.t:C.g2):'#d8def0';circ(c,x+24,sy+5,2);c.fill()}}
  var sk=E.io(P(t,.9,1.1)),SX=97,SY=164,SR=84;
  if(sk>0){c.fillStyle=rg(c,SX,SY,10,SR,[[0,'rgba(172,91,255,0)'],[1,'rgba(172,91,255,'+(.13*sk)+')']]);c.beginPath();c.moveTo(SX-SR,SY);c.arc(SX,SY,SR,Math.PI,Math.PI+Math.PI*sk);c.lineTo(SX,SY);c.closePath();c.fill();
    c.strokeStyle=lg(c,SX-SR,0,SX+SR,0,[[0,C.pd],[1,C.td]]);c.lineWidth=3;c.beginPath();c.arc(SX,SY,SR,Math.PI,Math.PI+Math.PI*sk);c.stroke();
    if(sk>=1){var sh=(t*.5)%1;c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=3;c.beginPath();c.arc(SX,SY,SR,Math.PI+sh*Math.PI-.12,Math.PI+sh*Math.PI+.12);c.stroke()}}
  var ta=P(t,.6,.6);tx(c,'AWS protege',196,84,{s:19,w:700,f:'display',al:ta});tx(c,'la central',196,106,{s:19,w:700,f:'display',al:ta});
  tx(c,'hardware · red · regiones',196,130,{s:13,c:C.muted,al:ta});tx(c,'de eso no te preocupas',196,150,{s:13,c:C.muted,al:ta});
  // --- capa TÚ ---
  var breach=t>5.1&&t<7.1?E.bump(((t-5.1)%.66)/.66):0,fixed=t>=8,fx=P(t,7,1.2);
  c.globalAlpha=E.out(P(t,1.4,.5));rr(c,12,194,356,156,16);c.fillStyle=breach>0?mix('#fff4e5','#ffe1e1',breach):'rgba(255,153,0,.06)';c.fill();
  c.strokeStyle=breach>0?col(C.red,.5+.5*breach):fixed?'rgba(18,161,90,.55)':'rgba(255,153,0,.5)';c.lineWidth=1.6+breach*1.5;c.stroke();c.globalAlpha=1;
  var hk=E.back(P(t,1.6,.8));if(hk>0){c.save();c.translate(96,330);c.scale(hk,hk);c.translate(-96,-330);
    c.fillStyle='#fff';c.strokeStyle=C.od;c.lineWidth=2.2;
    c.beginPath();c.moveTo(38,274);c.lineTo(96,230);c.lineTo(154,274);c.closePath();c.fillStyle='#ffe9c7';c.fill();c.stroke();
    rr(c,48,272,96,58,3);c.fillStyle='#fff';c.fill();c.stroke();
    rr(c,58,284,20,18,2);c.fillStyle='#ffd27a';c.fill();c.strokeStyle=C.od;c.lineWidth=1.6;c.stroke();c.beginPath();c.moveTo(68,284);c.lineTo(68,302);c.moveTo(58,293);c.lineTo(78,293);c.stroke();
    // puerta: abierta hasta el arreglo
    var open=1-E.io(P(t,7.5,.6));c.fillStyle='#2a3440';c.fillRect(88,296,24,34);
    var dw=24*(1-.72*open);c.beginPath();c.moveTo(88,296);c.lineTo(88+dw,296+4*open);c.lineTo(88+dw,330-4*open);c.lineTo(88,330);c.closePath();
    c.fillStyle=fixed?'#e8f7ee':'#ffe9c7';c.fill();c.strokeStyle=fixed?C.g:C.od;c.lineWidth=1.8;c.stroke();
    // llave colgada afuera → a la chapa
    var kp=E.io(P(t,7,.6));if(!fixed){var kx=lerp(122,100,kp),ky=lerp(306,313,kp),sw=Math.sin(t*3)*.25*(1-kp);
      c.save();c.translate(kx,ky);c.rotate(sw+kp*1.57);c.strokeStyle=C.od;c.lineWidth=2;circ(c,0,-6,4);c.stroke();c.beginPath();c.moveTo(0,-2);c.lineTo(0,10);c.moveTo(0,6);c.lineTo(3,6);c.moveTo(0,9);c.lineTo(3,9);c.stroke();c.restore();
      if(kp===0){c.strokeStyle='rgba(255,153,0,'+(.4+.4*Math.sin(t*5))+')';c.lineWidth=1.2;circ(c,122,306,11);c.stroke()}}
    else{var lk=E.back(P(t,8,.4));c.save();c.translate(100,313);c.scale(lk,lk);c.strokeStyle=C.g;c.lineWidth=1.8;c.beginPath();c.arc(0,-3,3.5,Math.PI,0);c.stroke();rr(c,-5,-3,10,8,1.5);c.fillStyle=C.g;c.fill();c.restore()}
    c.restore()}
  var tb=P(t,1.8,.6);tx(c,'Tú cuidas',196,236,{s:19,w:700,f:'display',al:tb});tx(c,'tus llaves',196,258,{s:19,w:700,f:'display',al:tb});
  tx(c,'tu bucket cerrado · claves',196,282,{s:13,c:C.muted,al:tb});
  if(t>5.1&&t<8.1)tx(c,'aquí vive el error más caro',196,306,{s:12.5,w:700,c:'#d1381a',al:.55+.45*Math.sin(t*9)*.5+.25});
  if(fixed)tx(c,'llaves guardadas · a salvo',196,306,{s:12.5,w:700,c:C.g,al:P(t,8,.4)});
  // --- amenazas ---
  disparo(c,t,2.6,[392,38],[108,82],[300,-10],C.pd);
  if(t>4&&t<5.3){var kb=P(t,4,1),e=E.in(kb);amenaza(c,lerp(394,106,e),lerp(346,318,e),1-P(t,5,.25),t*6)}
  if(breach>0){c.fillStyle=col(C.red,.18*breach);rr(c,38,228,118,104,6);c.fill()}
  disparo(c,t,8.6,[394,346],[114,318],[250,372],C.g);
  if(t>10.4){var cyc=(t-10.4)%3.2,idx=Math.floor((t-10.4)/3.2);
    if(idx%2===0)disparo(c,cyc,0,[392,38],[108,82],[300,-10],C.pd);else disparo(c,cyc,0,[394,346],[114,318],[250,372],C.g)}
  // destello del escudo cuando lo golpean
  var hit=Math.max(t>3.4&&t<4.1?1-P(t,3.4,.7):0,t>10.4&&Math.floor((t-10.4)/3.2)%2===0&&((t-10.4)%3.2)>.8&&((t-10.4)%3.2)<1.5?1-P((t-10.4)%3.2,.8,.7):0);
  if(hit>0){c.strokeStyle='rgba(172,91,255,'+hit+')';c.lineWidth=3+5*hit;glow(c,'rgba(172,91,255,.8)',14*hit);c.beginPath();c.arc(SX,SY,SR,Math.PI,2*Math.PI);c.stroke();noglow(c)}
}});

/* =====================================================================
   8 · CADA BOTÓN ES UN COMANDO · el clic de la consola es una llamada a la API
   ===================================================================== */
var CMDS=[
  {t:1.9,d:1.7,s:'$ aws s3api create-bucket --bucket mi-cafeteria',o:'  HTTP 200 · bucket creado ✓',slot:0},
  {t:5.6,d:.8,s:'$ aws s3api put-bucket-policy --bucket mi-cafeteria …',o:'  HTTP 204 · solo CloudFront puede leer ✓',slot:1},
  {t:7.0,d:.8,s:'$ aws cloudfront create-distribution --origin …',o:'  Deployed · 600+ puntos ✓',slot:2},
  {t:8.4,d:.8,s:'$ aws bedrock-runtime invoke-model --model-id …',o:'  HTTP 200 · la IA responde ✓',slot:3}];
var SLOTS=[['Arch_Amazon-S3_48','S3'],['Arch_AWS-Identity-and-Access-Management_48','política'],['Arch_Amazon-CloudFront_48','CloudFront'],['Arch_Amazon-Bedrock_48','Bedrock']];
def('comando',{w:400,h:330,rest:10.5,draw:function(c,S,t){
  var L=12,lt=RM?10.5:t%L,out=1-P(lt,11.4,.6);c.globalAlpha=out;
  // --- consola ---
  var dim=1-.62*E.io(P(lt,5.1,.5));c.save();c.globalAlpha=out*dim;
  rr(c,16,12,368,104,10);c.fillStyle='#f6f8fa';c.fill();c.strokeStyle='#d5dce4';c.lineWidth=1.2;c.stroke();
  c.save();rr(c,16,12,368,104,10);c.clip();c.fillStyle='#232F3E';c.fillRect(16,12,368,24);c.restore();
  tx(c,'aws',28,29,{s:12,w:800,f:'display',c:'#fff'});c.fillStyle=C.o;c.fillRect(28,31,22,2);
  tx(c,'Consola de AWS · Amazon S3',62,28,{s:10.5,f:'mono',c:'#c9d2dc'});
  tx(c,'Nombre del bucket',28,56,{s:11,c:C.muted});
  rr(c,28,62,200,28,6);c.fillStyle='#fff';c.fill();c.strokeStyle='#c9d2dc';c.lineWidth=1.2;c.stroke();tx(c,'mi-cafeteria',38,80,{s:12.5,f:'mono',c:C.ink});
  var press=lt>1.3&&lt<1.55;rr(c,244,62,124,28,6);c.fillStyle=press?C.od:C.o;c.fill();tx(c,'Crear bucket',306,80,{s:12.5,w:700,c:'#fff',a:'center'});
  var rk=P(lt,1.3,.6);if(rk>0&&rk<1){c.strokeStyle=col(C.o,1-rk);c.lineWidth=2;circ(c,306,76,6+26*E.out(rk));c.stroke()}
  c.restore();c.globalAlpha=out;
  // cursor
  if(lt<5){var ck=E.io(P(lt,.2,1.1)),cx=lerp(392,306,ck),cy=lerp(128,78,ck),sc=press?.85:1;c.save();c.translate(cx,cy);c.scale(sc,sc);
    c.beginPath();c.moveTo(0,0);c.lineTo(0,17);c.lineTo(4.5,13);c.lineTo(8,20);c.lineTo(10.5,19);c.lineTo(7,12);c.lineTo(12.5,12);c.closePath();
    c.fillStyle=C.ink;c.fill();c.strokeStyle='#fff';c.lineWidth=1.3;c.stroke();c.restore()}
  var pill=P(lt,5.2,.4);if(pill>0){c.globalAlpha=out*pill;rr(c,110,50,180,30,15);c.fillStyle=C.ink;c.fill();tx(c,'ahora sin clic: un script',200,70,{s:12.5,w:700,c:'#fff',a:'center'});c.globalAlpha=out}
  // --- el cable detrás del botón ---
  var cable=P(lt,1.5,.5);c.strokeStyle='#d5dce4';c.lineWidth=2;c.setLineDash([4,4]);c.beginPath();c.moveTo(306,92);c.lineTo(306,146);c.stroke();c.setLineDash([]);
  if(cable>0&&cable<1){var yy=lerp(92,146,E.io(cable));glow(c,'rgba(255,153,0,.8)',10);c.fillStyle=C.o;circ(c,306,yy,4);c.fill();noglow(c)}
  tx(c,'lo que viaja por debajo:',300,134,{s:10.5,f:'mono',c:C.oc,a:'right',al:P(lt,1.5,.4)});
  // --- terminal ---
  rr(c,16,148,368,80,10);c.fillStyle='#0f161e';c.fill();
  ['#ff5f57','#febc2e','#28c840'].forEach(function(cc,j){c.fillStyle=cc;circ(c,30+j*10,160,3);c.fill()});tx(c,'terminal · API de AWS',64,163,{s:10,f:'mono',c:C.dfaint});
  var lines=[];CMDS.forEach(function(m){if(lt<m.t)return;var n=Math.floor(m.s.length*P(lt,m.t,m.d));lines.push({s:m.s.slice(0,n),k:'c',typing:n<m.s.length});
    if(lt>m.t+m.d+.2)lines.push({s:m.o,k:'o'})});
  var vis=lines.slice(-3);vis.forEach(function(l,j){var y=184+j*17;
    if(l.k==='c'){tx(c,l.s.slice(0,1),28,y,{s:11,w:700,f:'mono',c:C.o});tx(c,l.s.slice(1),36,y,{s:11,f:'mono',c:'#e6edf3'})}else tx(c,l.s,28,y,{s:11,f:'mono',c:C.g2});
    if(l.typing||(j===vis.length-1&&Math.floor(lt*2.2)%2===0&&!l.typing&&l.k==='o')){c.font='400 11px '+F.mono;var w=c.measureText(l.s).width;c.fillStyle=C.o;c.fillRect(30+w,y-9,6,11)}});
  // --- tu cuenta de AWS ---
  rr(c,16,240,368,66,10);c.fillStyle='rgba(124,60,237,.05)';c.fill();c.strokeStyle='rgba(123,47,245,.35)';c.lineWidth=1.2;c.stroke();
  tx(c,'tu cuenta de AWS',28,258,{s:10.5,f:'mono',c:C.muted});tx(c,'lo que se crea →',28,276,{s:10.5,f:'mono',c:C.faint});
  CMDS.forEach(function(m,i){var x=160+i*62,y=270,pk=P(lt,m.t+m.d,.5);
    if(pk>0&&pk<1){var e=E.io(pk),px=lerp(200,x,e),py=lerp(228,y,e);glow(c,'rgba(255,153,0,.8)',10);c.fillStyle=C.o;circ(c,px,py,3.5);c.fill();noglow(c)}
    var k=P(lt,m.t+m.d+.45,.4);c.setLineDash([3,4]);c.strokeStyle='#cfd7e1';c.lineWidth=1.2;rr(c,x-18,y-18,36,36,8);c.stroke();c.setLineDash([]);
    if(k>0){var s=E.back(k);c.save();c.translate(x,y);c.scale(s,s);icon(c,SLOTS[i][0],0,0,34);c.restore();
      if(k>=1){c.fillStyle=C.g;circ(c,x+15,y-15,6.5);c.fill();c.strokeStyle='#fff';c.lineWidth=1.8;c.beginPath();c.moveTo(x+12,y-15);c.lineTo(x+14.4,y-12.6);c.lineTo(x+18.4,y-17.4);c.stroke()}}
    tx(c,SLOTS[i][1],x,y+30,{s:9.5,f:'mono',c:k>0?C.ink:C.faint,a:'center'})});
  tx(c,'lo que hace un clic, lo hace un comando… o una IA',200,324,{s:13.5,w:700,f:'display',c:C.ink,a:'center',al:P(lt,9.6,.6)});
  c.globalAlpha=1}});

/* =====================================================================
   9 · BEDROCK · un prompt en español se vuelve una página
   ===================================================================== */
var PROMPT='Crea la página de mi cafetería en Pereira';
def('bedrock',{w:400,h:320,rest:9.5,draw:function(c,S,t){
  var L=11.5,lt=RM?9.5:t%L,out=1-P(lt,10.9,.6),CX=104,CY=192;
  c.globalAlpha=out;
  // burbuja del prompt
  rr(c,12,14,292,58,14);c.fillStyle='#fff';c.fill();c.strokeStyle='#c9d2dc';c.lineWidth=1.8;c.stroke();
  c.beginPath();c.moveTo(30,71);c.lineTo(30,86);c.lineTo(46,71);c.fillStyle='#fff';c.fill();c.stroke();c.fillStyle='#fff';c.fillRect(31,68,14,4);
  tx(c,'tu prompt',26,34,{s:11,f:'mono',c:C.faint});
  var nch=Math.floor(PROMPT.length*P(lt,.3,1.9)),typed=PROMPT.slice(0,nch);
  tx(c,typed,26,57,{s:13.5,w:500,c:C.ink});
  if(lt<2.6&&Math.floor(lt*2.4)%2===0){c.font='500 13.5px '+F.body;var tw=c.measureText(typed).width;c.fillStyle=C.pd;c.fillRect(27+tw,45,2,15)}
  // núcleo Bedrock
  var think=E.bump(P(lt,2.9,1.8)),spin=lt*(.7+2.4*think);
  c.fillStyle=rg(c,CX,CY,10,72+14*think,[[0,'rgba(255,153,0,'+(.1+.25*think)+')'],[1,'rgba(255,153,0,0)']]);circ(c,CX,CY,86);c.fill();
  for(var o=0;o<2;o++){c.save();c.translate(CX,CY);c.rotate(o?-.5:.6);c.strokeStyle=o?'rgba(65,179,255,.55)':'rgba(172,91,255,.55)';c.lineWidth=1.4;c.setLineDash([4,6]);c.lineDashOffset=-spin*20*(o?-1:1);
    c.beginPath();c.ellipse(0,0,56,22,0,0,Math.PI*2);c.stroke();c.setLineDash([]);
    var an=spin*(o?-1.3:1)+o*2;c.fillStyle=o?C.t:C.p;circ(c,Math.cos(an)*56,Math.sin(an)*22,3.2);c.fill();c.restore()}
  rr(c,CX-30,CY-30,60,60,12);c.fillStyle='#fff';glow(c,'rgba(1,168,141,'+(.3+.5*think)+')',12+18*think);c.fill();noglow(c);icon(c,'Arch_Amazon-Bedrock_48',CX,CY,52);
  tx(c,'Amazon Bedrock',CX,CY+64,{s:14,w:700,f:'display',c:C.oc,a:'center'});
  // tokens de entrada
  for(var i=0;i<8;i++){var T=2.25+i*.12,k=P(lt,T,.7);if(k<=0||k>=1)continue;var e=E.io(k),q=quad([40+i*30,70],[CX,CY],[70+i*8,120],e);
    c.globalAlpha=out*(1-E.in(k)*.6);rr(c,q[0]-9*(1-e*.6),q[1]-4,18*(1-e*.6),8,4);c.fillStyle=i%2?C.t:C.p;c.fill();c.globalAlpha=out}
  // página que se arma
  var PX=214,PY=92;var fa=E.out(P(lt,4,.5));
  if(fa>0){c.globalAlpha=out*fa;rr(c,PX,PY,176,196,10);c.fillStyle='#fff';glow(c,'rgba(21,29,37,.12)',18);c.fill();noglow(c);c.strokeStyle='#d5dce4';c.lineWidth=1.4;c.stroke();
    c.fillStyle='#f1f4f8';c.beginPath();c.roundRect(PX,PY,176,16,[10,10,0,0]);c.fill();['#ff5f57','#febc2e','#28c840'].forEach(function(cc,j){c.fillStyle=cc;circ(c,PX+10+j*9,PY+8,2.6);c.fill()});c.globalAlpha=out}
  function blk(T,fn){var k=P(lt,T,.45);if(k<=0)return;c.save();c.globalAlpha=out*k;var s=.85+.15*E.back(k);fn(s);c.restore()}
  blk(4.3,function(){rr(c,PX+8,PY+24,160,10,3);c.fillStyle='#eef1f5';c.fill();c.fillStyle=C.o;circ(c,PX+14,PY+29,3);c.fill();c.fillStyle='#cfd7e1';[0,1,2].forEach(function(j){c.fillRect(PX+120+j*14,PY+28,10,2.4)})});
  blk(4.8,function(s){c.translate(PX+88,PY+72);c.scale(s,s);rr(c,-80,-32,160,64,6);c.fillStyle=lg(c,-80,-32,80,32,[[0,'#5a3320'],[1,'#b8733f']]);c.fill()});
  blk(5.2,function(){rr(c,PX+18,PY+52,80,8,3);c.fillStyle='#fff';c.fill();rr(c,PX+18,PY+66,58,5,2);c.fillStyle='rgba(255,255,255,.7)';c.fill()});
  blk(5.6,function(){var x=PX+138,y=PY+76;c.fillStyle='#fff';c.beginPath();c.moveTo(x-12,y-8);c.lineTo(x+10,y-8);c.lineTo(x+7,y+10);c.lineTo(x-9,y+10);c.closePath();c.fill();
    c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(x+12,y-1,5,-1.2,1.2);c.stroke();
    c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=1.6;for(var j=0;j<3;j++){c.beginPath();var bx=x-6+j*6;for(var u=0;u<=10;u++){var yy=y-12-u*1.6,xx=bx+Math.sin(u*.7+lt*5+j)*2;u?c.lineTo(xx,yy):c.moveTo(xx,yy)}c.stroke()}});
  blk(6.0,function(s){c.translate(PX+42,PY+88);c.scale(s,s);rr(c,-24,-7,48,14,7);c.fillStyle=C.o;c.fill();tx(c,'Reservar',0,3,{s:8,w:700,c:'#fff',a:'center'})});
  blk(6.4,function(){c.fillStyle='#dde3ea';[[0,150],[0,130],[0,140]].forEach(function(r,j){rr(c,PX+8,PY+112+j*9,r[1],4,2);c.fill()})});
  [6.8,7.1,7.4].forEach(function(T,j){blk(T,function(s){var x=PX+8+j*54,y=PY+144;c.translate(x+24,y+20);c.scale(s,s);rr(c,-24,-20,48,40,6);c.fillStyle='#f6f8fa';c.fill();c.strokeStyle='#e3e6ec';c.lineWidth=1;c.stroke();
    rr(c,-18,-14,36,14,3);c.fillStyle=['#e6c7a6','#c9a27e','#a9744b'][j];c.fill();c.fillStyle='#d5dce4';c.fillRect(-18,5,30,3);c.fillRect(-18,11,22,3)})});
  // chorro de salida núcleo → página
  if(lt>4.1&&lt<7.8){for(var k2=0;k2<14;k2++){var ph=((lt*1.6)+k2/14)%1,q2=quad([CX+30,CY-6],[PX+20+(k2*37)%150,PY+30+(k2*53)%150],[170,110+(k2%3)*30],E.io(ph));
      c.fillStyle=k2%3===0?col(C.o,.8*(1-ph)):col(k2%2?C.p:C.t,.7*(1-ph));circ(c,q2[0],q2[1],2.4*(1-ph*.5));c.fill()}}
  // cierre
  var ca=P(lt,7.7,.5);if(ca>0){tx(c,'le pides en español… y lo crea de la nada',200,312,{s:14,w:700,f:'display',c:C.ink,a:'center',al:ca});
    for(var sp=0;sp<4;sp++){var a2=Math.sin(lt*4+sp*1.7);if(a2<.3)continue;var sx=[PX+4,PX+172,PX+170,PX+6][sp],sy=[PY+4,PY+4,PY+192,PY+192][sp];
      c.fillStyle=col(C.o,a2*ca);c.beginPath();c.moveTo(sx,sy-6);c.lineTo(sx+1.6,sy-1.6);c.lineTo(sx+6,sy);c.lineTo(sx+1.6,sy+1.6);c.lineTo(sx,sy+6);c.lineTo(sx-1.6,sy+1.6);c.lineTo(sx-6,sy);c.lineTo(sx-1.6,sy-1.6);c.fill()}}
  c.globalAlpha=1}});

/* =====================================================================
   11 · PROPÓSITO · la idea muerta parpadea… y se enciende
   ===================================================================== */
def('bombillo',{w:340,h:380,rest:6,draw:function(c,S,t){
  var CX=170,CY=150,R=80,IG=2.3,lv;
  if(t<1)lv=0;else if(t<IG){var st=Math.floor(t/.07);lv=hash(st*3+1)>.62?.35+.5*hash(st):.04}else lv=.86+.14*Math.sin(t*2.2);
  var flash=t>=IG?1-P(t,IG,1):0,lit=t>=IG?E.out(P(t,IG,.5)):0;
  c.globalCompositeOperation='lighter';
  c.fillStyle=rg(c,CX,CY,0,80+84*lv,[[0,'rgba(255,190,90,'+(.5*lv)+')'],[.45,'rgba(255,153,0,'+(.18*lv)+')'],[1,'rgba(255,153,0,0)']]);circ(c,CX,CY,166);c.fill();
  if(lit>0){for(var i=0;i<14;i++){var an=i/14*Math.PI*2+t*.12,len=64*lit*(.72+.28*Math.sin(t*3+i*1.3));if(Math.sin(an)>.55)continue;
    c.strokeStyle='rgba(255,170,60,'+(.75*lit)+')';c.lineWidth=3;c.beginPath();c.moveTo(CX+Math.cos(an)*(R+18),CY+Math.sin(an)*(R+18));c.lineTo(CX+Math.cos(an)*(R+18+len),CY+Math.sin(an)*(R+18+len));c.stroke()}}
  // partículas: ideas que salen a medio planeta
  if(t>IG+.1){var n0=Math.max(0,Math.floor((t-IG-.1-2.8)*30)),n1=Math.floor((t-IG-.1)*30);
    for(var k=n0;k<=n1;k++){var age=t-IG-.1-k/30;if(age<0||age>2.8)continue;var an2=-Math.PI*(.12+.76*hash(k*7+2)),sp=38+60*hash(k*3+9),
      dist=R*.9+sp*age,cu=Math.sin(age*2+k)*.18,x=CX+Math.cos(an2+cu)*dist,y=CY+Math.sin(an2+cu)*dist,a=(1-age/2.8);
      c.fillStyle=hash(k*11)>.8?'rgba(172,91,255,'+a+')':hash(k*5)>.5?'rgba(255,210,120,'+a+')':'rgba(255,153,0,'+a+')';circ(c,x,y,1.2+1.8*hash(k*13)*(1-age/4));c.fill()}}
  c.globalCompositeOperation='source-over';
  // vidrio
  function glass(){c.beginPath();c.arc(CX,CY,R,.75*Math.PI,.25*Math.PI);c.quadraticCurveTo(CX+44,CY+80,CX+30,CY+100);c.lineTo(CX-30,CY+100);c.quadraticCurveTo(CX-44,CY+80,CX-R*.707,CY+R*.707);c.closePath()}
  glass();c.fillStyle=lv>.05?rg(c,CX,CY-10,5,R+10,[[0,'rgba(255,248,225,'+(.95*lv)+')'],[.5,'rgba(255,196,100,'+(.55*lv)+')'],[1,'rgba(255,153,0,'+(.18*lv)+')']]):'rgba(170,182,194,.06)';c.fill();
  c.strokeStyle=lv>.05?mix('#4a5866','#ffb347',lv):'#4a5866';c.lineWidth=2.6;if(lv>.3)glow(c,'rgba(255,153,0,.7)',16*lv);c.stroke();noglow(c);
  c.strokeStyle='rgba(255,255,255,'+(.12+.25*lv)+')';c.lineWidth=3;c.beginPath();c.arc(CX,CY,R-12,1.12*Math.PI,1.38*Math.PI);c.stroke();
  // filamento (rayo)
  c.save();c.translate(CX-8,CY-44);c.beginPath();c.moveTo(12,0);c.lineTo(-10,34);c.lineTo(4,34);c.lineTo(-2,64);c.lineTo(22,26);c.lineTo(8,26);c.lineTo(14,0);c.closePath();
  if(lv>.05){c.fillStyle='#fff6dc';glow(c,'rgba(255,170,40,.95)',24*lv);c.fill();c.fill();noglow(c)}else{c.strokeStyle='#5b6b78';c.lineWidth=2;c.stroke()}c.restore();
  // rosca
  var bc=lv>.05?mix('#3a4652','#8a97a5',lit):'#3a4652';[[CX-30,CY+102,60],[CX-27,CY+116,54],[CX-24,CY+130,48]].forEach(function(b){rr(c,b[0],b[1],b[2],11,3);c.fillStyle=bc;c.fill()});
  rr(c,CX-12,CY+143,24,10,4);c.fillStyle='#2e3a48';c.fill();
  // polvo de idea dormida
  if(t<IG){for(var d=0;d<7;d++){var dx=CX-40+hash(d*5)*80+Math.sin(t*.8+d)*6,dy=CY-30+hash(d*9)*70+Math.cos(t*.6+d)*5;c.fillStyle='rgba(170,182,194,.35)';circ(c,dx,dy,1.4);c.fill()}}
  if(flash>0){c.globalCompositeOperation='lighter';c.fillStyle=rg(c,CX,CY,0,166,[[0,'rgba(255,240,210,'+(.8*flash)+')'],[1,'rgba(255,153,0,0)']]);circ(c,CX,CY,166);c.fill();c.globalCompositeOperation='source-over'}
  var cap=P(t,IG,.6);tx(c,'idea apagada · nadie la ve',CX,356,{s:12.5,f:'mono',c:C.dfaint,a:'center',al:1-cap});
  tx(c,'idea encendida · al alcance de medio planeta',CX,356,{s:12.5,f:'mono',c:C.o,a:'center',al:cap});
}});

/* =====================================================================
   12 · EL CIRCUITO · la corriente enciende nodo por nodo hasta el mundo
   ===================================================================== */
def('circuito',{w:1200,h:372,rest:9,draw:function(c,S,t){
  var X=[120,360,600,840,1080],Y=150,R=[52,56,52,52,52],IG=[.9,1.9,2.9,3.9,4.9],hot=[0,1,0,0,1];
  var L1=['la chispa','el interruptor','donde vive','el cableado','el mundo'],L2=['tú + Bedrock','un comando','Amazon S3','CloudFront','se enciende'];
  // cables
  for(var i=0;i<4;i++){var a=X[i]+R[i],b=X[i+1]-R[i+1];c.strokeStyle='#2e3a48';c.lineWidth=3;c.beginPath();c.moveTo(a,Y);c.lineTo(b,Y);c.stroke();
    var fk=E.io(P(t,IG[i]+.15,IG[i+1]-IG[i]-.15)),fx=lerp(a,b,fk);
    if(fk>0){c.strokeStyle=lg(c,a,0,b,0,[[0,C.p],[1,C.t]]);glow(c,'rgba(65,179,255,.6)',8);c.beginPath();c.moveTo(a,Y);c.lineTo(fx,Y);c.stroke();noglow(c);
      c.fillStyle=C.t;c.beginPath();c.moveTo(b,Y);c.lineTo(b-14,Y-7);c.lineTo(b-14,Y+7);c.closePath();c.globalAlpha=fk>=1?1:.25;c.fill();c.globalAlpha=1}
    if(fk>0&&fk<1){c.globalCompositeOperation='lighter';c.fillStyle=rg(c,fx,Y,0,18,[[0,'rgba(255,255,255,1)'],[.3,'rgba(255,153,0,.9)'],[1,'rgba(255,153,0,0)']]);circ(c,fx,Y,18);c.fill();c.globalCompositeOperation='source-over'}}
  // corriente continua
  var cur=[];if(t>5.3){c.globalCompositeOperation='lighter';for(var k=0;k<5;k++){var ph=((t-5.3)*.26+k/5)%1,px=lerp(X[0],X[4],ph);cur.push(px);
      c.strokeStyle=lg(c,px-70,0,px,0,[[0,'rgba(255,153,0,0)'],[1,'rgba(255,190,90,.9)']]);c.lineWidth=4;c.beginPath();c.moveTo(Math.max(X[0],px-70),Y);c.lineTo(px,Y);c.stroke();
      c.fillStyle=rg(c,px,Y,0,12,[[0,'rgba(255,255,255,.95)'],[1,'rgba(255,153,0,0)']]);circ(c,px,Y,12);c.fill()}c.globalCompositeOperation='source-over'}
  // abanico de CloudFront hacia el borde
  var fan=P(t,IG[3]+.2,.8);if(fan>0){for(var f=0;f<7;f++){var an=(-160+f*(100/6))*D2R,ex=X[3]+Math.cos(an)*84,ey=Y+Math.sin(an)*84,ek=clamp(fan*1.4-f*.06,0,1);
      c.strokeStyle='rgba(255,153,0,'+(.35*ek)+')';c.lineWidth=1.4;c.setLineDash([3,5]);c.lineDashOffset=-t*12;c.beginPath();c.moveTo(X[3]+Math.cos(an)*54,Y+Math.sin(an)*54);c.lineTo(lerp(X[3]+Math.cos(an)*54,ex,ek),lerp(Y+Math.sin(an)*54,ey,ek));c.stroke();c.setLineDash([]);
      if(ek>=1){c.fillStyle=C.o;glow(c,'rgba(255,153,0,.8)',8);circ(c,ex,ey,3+Math.sin(t*4+f)*.8);c.fill();noglow(c)}}}
  // órbita de personas alrededor del mundo
  var wk=P(t,IG[4],1.2);if(wk>0){for(var o=0;o<22;o++){var rx=64+(o%4)*7,ry=rx*.58,an2=t*(.5+(o%3)*.18)+o*2.1,ok=clamp(wk*1.6-o*.03,0,1);
      c.fillStyle=o%3===0?col(C.o,.9*ok):col(o%2?C.p:C.t,.85*ok);circ(c,X[4]+Math.cos(an2)*rx,Y+Math.sin(an2)*ry,2.4);c.fill()}}
  // nodos
  for(var n=0;n<5;n++){var lk=P(t,IG[n],.4),lit=E.out(lk),x=X[n],r=R[n],near=0;
    cur.forEach(function(px){near=Math.max(near,clamp(1-Math.abs(px-x)/40,0,1))});
    var bk=P(t,IG[n],.8);if(bk>0&&bk<1){c.strokeStyle=hot[n]?'rgba(255,153,0,'+(1-bk)+')':'rgba(65,179,255,'+(1-bk)+')';c.lineWidth=2.5;circ(c,x,Y,r+4+34*E.out(bk));c.stroke()}
    if(lit>0){var br=.18+.1*Math.sin(t*2+n)+.35*near;c.fillStyle=rg(c,x,Y,r*.6,r+28,[[0,hot[n]?'rgba(255,153,0,'+br+')':'rgba(172,91,255,'+br+')'],[1,'rgba(0,0,0,0)']]);circ(c,x,Y,r+28);c.fill()}
    circ(c,x,Y,r);c.fillStyle=C.panel2;c.fill();
    c.strokeStyle=lit>0?(hot[n]?lg(c,x-r,Y-r,x+r,Y+r,[[0,C.o],[1,C.r]]):lg(c,x-r,Y-r,x+r,Y+r,[[0,C.p],[1,C.t]])):'#2e3a48';c.lineWidth=hot[n]?3:2.5;c.stroke();
    if(n===1&&lit>0){c.save();c.translate(x,Y);c.rotate(t*.7);c.strokeStyle='rgba(255,153,0,.6)';c.lineWidth=1.5;c.setLineDash([5,11]);circ(c,0,0,70);c.stroke();c.setLineDash([]);c.restore()}
    var ia=.3+.7*lit;
    if(n===0)icon(c,'Arch_Amazon-Bedrock_48',x,Y,56,ia);
    if(n===2)icon(c,'Arch_Amazon-S3_48',x,Y,56,ia);
    if(n===3)icon(c,'Arch_Amazon-CloudFront_48',x,Y,56,ia);
    if(n===1){c.strokeStyle=lit>0?C.o:'#4a5866';c.lineWidth=3.2;if(lit>0)glow(c,'rgba(255,153,0,.8)',12*lit);c.beginPath();c.arc(x,Y+1,15,-Math.PI/2+.75,-Math.PI/2+.75+(Math.PI*2-1.5));c.stroke();
      c.beginPath();c.moveTo(x,Y-17);c.lineTo(x,Y+1);c.stroke();noglow(c)}
    if(n===4){c.strokeStyle=lit>0?C.t:'#4a5866';c.lineWidth=2.5;circ(c,x-6,Y-7,5.5);c.stroke();c.beginPath();c.arc(x-6,Y+13,9,Math.PI,0);c.stroke();circ(c,x+9,Y-3,4.5);c.stroke();c.beginPath();c.arc(x+9,Y+14,8,Math.PI,0);c.stroke()}
    tx(c,L1[n],x,242,{s:20,w:600,f:'display',c:'#fff',a:'center',al:.45+.55*lit});
    tx(c,L2[n],x,268,{s:14,f:'mono',c:n===1?C.o:C.t,a:'center',al:.45+.55*lit})}
  tx(c,'por HTTPS · a todos',960,112,{s:13,f:'mono',c:C.o,a:'center',al:P(t,IG[3]+.6,.6)});
  tx(c,'la corriente lleva tu idea al mundo  →',600,332,{s:15,f:'mono',c:C.o,a:'center',al:P(t,5.3,.8)});
}});

/* =====================================================================
   13 · SAQUEN EL CELULAR · escanea, detecta, abre
   ===================================================================== */
def('celular',{w:300,h:380,rest:4.2,
  init:function(S){if(S.qr)return;var r=rng(3),g=[],N=21;for(var y=0;y<N;y++)for(var x=0;x<N;x++){
      function fin(ox,oy){var dx=x-ox,dy=y-oy;if(dx<0||dy<0||dx>6||dy>6)return-1;return(dx===0||dy===0||dx===6||dy===6||(dx>1&&dx<5&&dy>1&&dy<5))?1:0}
      var f=Math.max(fin(0,0),fin(14,0),fin(0,14));var on=f>=0?f===1:r()>.52;if(on)g.push({x:x,y:y,f:f>=0,o:r()})}S.qr=g},
  draw:function(c,S,t){var L=6.4,lt=RM?4.2:t%L,out=1-P(lt,6,.4);
    var up=E.out(P(t,0,.7));c.save();c.translate(0,(1-up)*40);c.globalAlpha=up;
    rr(c,90,30,150,320,28);c.fillStyle=C.panel2;c.fill();c.strokeStyle=lg(c,90,30,240,350,[[0,C.p],[1,C.t]]);c.lineWidth=2.5;c.stroke();
    rr(c,140,46,50,8,4);c.fillStyle='#2e3a48';c.fill();
    c.globalAlpha=up*out;var SX=110,SY=110,SZ=110,cell=SZ/21,ok=P(lt,2.5,.35);
    S.qr.forEach(function(m){var T=1+m.o*1.2;if(lt<T&&!m.f)return;var k=m.f?P(lt,.5,.4):P(lt,T,.15);c.fillStyle=ok>0?mix('#ffffff',C.g2,ok,k):'rgba(255,255,255,'+(.9*k)+')';c.fillRect(SX+m.x*cell+.4,SY+m.y*cell+.4,cell-.8,cell-.8)});
    var cc=ok>0?C.g2:C.o,pul=1+.04*Math.sin(lt*6);c.strokeStyle=cc;c.lineWidth=3;
    [[SX-8,SY-8,1,1],[SX+SZ+8,SY-8,-1,1],[SX-8,SY+SZ+8,1,-1],[SX+SZ+8,SY+SZ+8,-1,-1]].forEach(function(q){var ox=SX+SZ/2,oy=SY+SZ/2,x=ox+(q[0]-ox)*pul,y=oy+(q[1]-oy)*pul;
      c.beginPath();c.moveTo(x,y+16*q[3]);c.lineTo(x,y);c.lineTo(x+16*q[2],y);c.stroke()});
    if(lt>.5&&lt<2.5){var sy=SY+SZ*(.5-.5*Math.cos((lt-.5)*Math.PI*1.4));c.fillStyle=lg(c,0,sy-18,0,sy,[[0,'rgba(255,153,0,0)'],[1,'rgba(255,153,0,.35)']]);c.fillRect(SX-6,sy-18,SZ+12,18);
      c.strokeStyle=C.o;c.lineWidth=2;glow(c,'rgba(255,153,0,.9)',10);c.beginPath();c.moveTo(SX-6,sy);c.lineTo(SX+SZ+6,sy);c.stroke();noglow(c)}
    if(ok>0){var ck=E.back(P(lt,2.6,.4));c.save();c.translate(SX+SZ/2,SY+SZ/2);c.scale(ck,ck);c.fillStyle='rgba(21,29,37,.8)';circ(c,0,0,24);c.fill();c.fillStyle=C.g;circ(c,0,0,19);c.fill();
      c.strokeStyle='#fff';c.lineWidth=3.4;c.beginPath();c.moveTo(-8,0);c.lineTo(-2,6);c.lineTo(9,-6);c.stroke();c.restore()}
    var wa=P(lt,3,.4);if(wa>0){for(var w=0;w<3;w++){var wk=((lt-3+w*.45)%1.35)/1.35;c.strokeStyle='rgba(172,91,255,'+(.7*(1-wk)*wa)+')';c.lineWidth=2.2;c.beginPath();c.arc(244,190,20+50*wk,-.7,.7);c.stroke()}
      rr(c,112,246,106,10,4);c.fillStyle='rgba(61,208,127,.2)';c.fill();rr(c,112,246,106*P(lt,3,1.2),10,4);c.fillStyle=C.g2;c.fill();
      tx(c,P(lt,3,1.2)<1?'abriendo…':'¡está vivo!',165,280,{s:12,w:700,f:'mono',c:C.g2,a:'center',al:wa})}
    c.restore()}});

/* =====================================================================
   16 · DE TI A MILLONES · un punto se vuelve una red de millones
   ===================================================================== */
def('escala',{w:440,h:340,rest:8,
  prep:function(){if(this.pts)return;var r=rng(21),pts=[],N=1100,RX=60,RY=290;
    for(var i=0;i<N*1.4&&pts.length<N;i++){var u=r(),g=(r()+r()+r()-1.5)/1.5,an=(35+g*24)*D2R,d=18+352*Math.pow(u,.62),x=RX+Math.cos(an)*d,y=RY-Math.sin(an)*d;
      if(x>430||y<14||y>300)continue;pts.push({x:x,y:y,d:d,c:r()})}
    pts.sort(function(a,b){return a.d-b.d});pts.forEach(function(p,i){if(i===0){p.par=-1;return}var best=-1,bd=1e9;
      for(var j=Math.max(0,i-60);j<i;j++){var q=pts[j],dd=(q.x-p.x)*(q.x-p.x)+(q.y-p.y)*(q.y-p.y);if(dd<bd){bd=dd;best=j}}p.par=best});
    this.pts=pts},
  draw:function(c,S,t){var d=this,pts=d.pts,N=pts.length,RX=60,RY=290;
    var g=clamp((t-.8)/5.2,0,1),n=Math.max(1,Math.floor(Math.pow(N,E.io(g)))),people=Math.pow(10,6*E.io(g));
    if(t<.8)n=0;
    c.strokeStyle='#2e3a48';c.lineWidth=3;c.beginPath();c.moveTo(RX,RY);c.lineTo(384,66);c.stroke();
    c.lineWidth=.8;for(var i=1;i<n;i++){var p=pts[i],q=pts[p.par];c.strokeStyle=p.d>230?'rgba(255,153,0,.13)':'rgba(120,150,255,.14)';c.beginPath();c.moveTo(q.x,q.y);c.lineTo(p.x,p.y);c.stroke()}
    c.globalCompositeOperation='lighter';
    for(i=0;i<n;i++){p=pts[i];var tb=.8+5.2*invIO(Math.log(i+1)/Math.log(N)),age=t-tb,nb=clamp(1-age/.5,0,1),tw=.7+.3*Math.sin(t*3+p.c*20);
      var colr=p.d>230?C.o:p.d>130?mix(C.t,C.o,(p.d-130)/100):mix(C.p,C.t,p.d/130);
      c.fillStyle=nb>0?'rgba(255,255,255,'+(.6+.4*nb)+')':colr;c.globalAlpha=tw;circ(c,p.x,p.y,1.5+2.4*nb+(p.d<40?1:0));c.fill()}
    c.globalAlpha=1;
    // señales que viajan de la raíz a las hojas
    if(g>=1){for(var s=0;s<5;s++){var cyc=Math.floor((t-6+s*.37)/1.6),ph=((t-6+s*.37)%1.6)/1.6;if(cyc<0)continue;var leaf=N-1-Math.floor(hash(cyc*17+s*3)*N*.4),chain=[];
        for(var k=leaf;k>=0;k=pts[k].par)chain.push(pts[k]);chain.reverse();var pos=ph*(chain.length-1),a=Math.floor(pos),b=Math.min(chain.length-1,a+1),f=pos-a;
        if(!chain[a])continue;var sx=lerp(chain[a].x,chain[b].x,f),sy=lerp(chain[a].y,chain[b].y,f);
        c.fillStyle=rg(c,sx,sy,0,9,[[0,'rgba(255,255,255,.95)'],[1,'rgba(255,153,0,0)']]);circ(c,sx,sy,9);c.fill()}}
    c.globalCompositeOperation='source-over';
    // interruptor raíz
    var rg2=.3+.7*g;c.fillStyle=rg(c,RX,RY,0,40,[[0,'rgba(255,153,0,'+(.45*rg2)+')'],[1,'rgba(255,153,0,0)']]);circ(c,RX,RY,40);c.fill();
    circ(c,RX,RY,21);c.fillStyle=C.panel2;c.fill();c.strokeStyle=lg(c,RX-21,RY-21,RX+21,RY+21,[[0,C.o],[1,C.r]]);c.lineWidth=2.6;c.stroke();
    c.strokeStyle=C.o;c.lineWidth=3;c.beginPath();c.arc(RX,RY+1,10,-Math.PI/2+.7,-Math.PI/2+.7+(Math.PI*2-1.4));c.stroke();c.beginPath();c.moveTo(RX,RY-13);c.lineTo(RX,RY+1);c.stroke();
    tx(c,'el mismo interruptor',6,328,{s:12,f:'mono',c:C.dfaint});
    // etapas
    [['tú, gratis',1,108,262],['una startup',100,182,212],['una empresa',1e4,264,156],['millones',1e6,360,112]].forEach(function(L,i){var a=P(t,.8+5.2*invIO(Math.log(L[1])/Math.LN10/6),.5);
      tx(c,L[0],L[2]+14,L[3]+20,{s:i===3?15:13,w:i===3?700:500,c:i===3?C.o:C.dmuted,al:a,st:'rgba(21,29,37,.85)'})});
    // contador
    tx(c,nf(people<1.5?1:people),18,44,{s:34,w:800,f:'display',c:'#fff'});
    tx(c,people<1.5?'persona':'personas',18,64,{s:13,f:'mono',c:C.dmuted});
  }});
/* =====================================================================
   RIFA · el podio de Kahoot se levanta y la moneda de créditos gira
   ===================================================================== */
def('podio',{w:400,h:360,rest:4,draw:function(c,S,t){
  var base=318,B=[{x:52,w:96,h:112,n:'2',T:.5},{x:152,w:96,h:138,n:'1',T:.9},{x:252,w:96,h:82,n:'3',T:.2}];
  // kahoot.it arriba
  var ka=E.out(P(t,0,.6)),pu=.5+.5*Math.sin(t*2.4);
  c.globalAlpha=ka;rr(c,110,12,180,40,20);c.fillStyle='rgba(172,91,255,.14)';c.fill();c.strokeStyle='rgba(172,91,255,'+(.5+.4*pu)+')';c.lineWidth=1.6;c.stroke();
  tx(c,'kahoot.it',200,39,{s:20,w:700,f:'mono',c:'#fff',a:'center'});c.globalAlpha=1;
  // luces del escenario
  c.globalCompositeOperation='lighter';
  [[110,.0],[200,1.3],[290,2.6]].forEach(function(L){var sw=Math.sin(t*.8+L[1])*30;c.fillStyle=lg(c,0,60,0,base,[[0,'rgba(172,91,255,.0)'],[1,'rgba(172,91,255,.16)']]);
    c.beginPath();c.moveTo(L[0]-6,60);c.lineTo(L[0]+6,60);c.lineTo(L[0]+sw+60,base);c.lineTo(L[0]+sw-60,base);c.closePath();c.fill()});
  c.globalCompositeOperation='source-over';
  // podio
  B.forEach(function(b){var k=E.back(P(t,b.T,.7)),h=b.h*k;if(h<=0)return;var y=base-h,gold=b.n==='1';
    rr(c,b.x,y,b.w,h,[8,8,0,0]);c.fillStyle=gold?lg(c,0,y,0,base,[[0,'#ffb347'],[1,'#c26a12']]):lg(c,0,y,0,base,[[0,'#2c3b4a'],[1,'#1b2531']]);c.fill();
    c.strokeStyle=gold?'rgba(255,200,120,.8)':'#3a4a5c';c.lineWidth=1.4;c.stroke();
    tx(c,b.n,b.x+b.w/2,y+Math.min(52,h-8),{s:40,w:800,f:'display',c:gold?'#151D25':'#aab6c2',a:'center',al:P(t,b.T+.4,.3)});
    // participante que salta encima
    var jk=P(t,b.T+.6,.4);if(jk>0){var hop=Math.abs(Math.sin(t*3+b.x))*6*jk,px=b.x+b.w/2,py=y-14-hop;
      c.fillStyle=gold?C.o:(b.n==='2'?C.t:C.p);circ(c,px,py-10,8);c.fill();c.beginPath();c.arc(px,py+9,12,Math.PI,0);c.fill()}});
  c.fillStyle='#2e3a48';c.fillRect(30,base,340,4);
  // moneda de créditos AWS sobre el primer puesto
  var mk=E.back(P(t,1.6,.6));if(mk>0){var cx=200,cy=100+Math.sin(t*1.6)*4,r=30*mk,sq=Math.cos(t*2.2),w=Math.max(.08,Math.abs(sq));
    c.fillStyle=rg(c,cx,cy,4,r+34,[[0,'rgba(255,190,90,.5)'],[1,'rgba(255,153,0,0)']]);circ(c,cx,cy,r+34);c.fill();
    c.save();c.translate(cx,cy);c.scale(w,1);circ(c,0,0,r);c.fillStyle=lg(c,-r,-r,r,r,[[0,'#ffd27a'],[1,'#e07600']]);c.fill();
    c.strokeStyle='#fff3d6';c.lineWidth=2;circ(c,0,0,r-5);c.stroke();
    if(sq>0){tx(c,'aws',0,4,{s:15,w:800,f:'display',c:'#151D25',a:'center'});c.fillStyle='#151D25';c.fillRect(-11,8,22,2.4)}else tx(c,'$',0,9,{s:26,w:800,f:'display',c:'#151D25',a:'center'});
    c.restore();tx(c,'USD 50',cx+44,cy-1,{s:17,w:800,f:'display',c:C.o,al:P(t,2,.4)});tx(c,'en créditos AWS',cx+44,cy+15,{s:11,w:700,f:'mono',c:C.o,al:P(t,2,.4)})}
  // confeti suave
  for(var i=0;i<40;i++){var sp=20+hash(i*7)*30,y2=((t*sp+hash(i*3)*400)%400)-20,x2=20+hash(i*11)*360+Math.sin(t+i)*8;if(t<1.8)break;
    c.save();c.translate(x2,y2);c.rotate(t*2+i);c.fillStyle=[C.o,C.p,C.t,C.g2,'#fff'][i%5];c.globalAlpha=.75;c.fillRect(-3,-1.5,6,3);c.restore()}
  c.globalAlpha=1;
  tx(c,'el 1.er lugar gana',200,348,{s:12.5,w:700,f:'mono',c:C.dmuted,a:'center',al:P(t,2.2,.5)})}});

/* utilidades compartidas con el demo en vivo (assets/demo.js) */
window.Escenas.u={E:E,P:P,clamp:clamp,lerp:lerp,hash:hash,rng:rng,rg:rg,lg:lg,rr:rr,circ:circ,tx:tx,icon:icon,glow:glow,noglow:noglow,col:col,mix:mix,quad:quad,nf:nf,C:C,F:F,
  ll2v:ll2v,rot:rot,dot3:dot3,D2R:D2R,PER:PER,setK:function(k){KS=k},RM:RM,
  globo:function(){DEFS.mundo.prep();return DEFS.mundo.pts}};
})();
