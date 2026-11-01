(function(){
var NS="http://www.w3.org/2000/svg",pad=document.getElementById("pad"),out=document.getElementById("out"),hint=document.getElementById("hint");
var C=[50,150,250],dots=[],rings=[],seq=[],drawing=false,timer=null;
var trail=document.createElementNS(NS,"polyline");trail.setAttribute("id","trail");pad.appendChild(trail);
for(var i=0;i<9;i++){
  var cx=C[i%3],cy=C[Math.floor(i/3)];
  var r=document.createElementNS(NS,"circle");r.setAttribute("cx",cx);r.setAttribute("cy",cy);r.setAttribute("r",24);r.setAttribute("class","ring");pad.appendChild(r);rings.push(r);
  var d=document.createElementNS(NS,"circle");d.setAttribute("cx",cx);d.setAttribute("cy",cy);d.setAttribute("r",9);d.setAttribute("class","dot");pad.appendChild(d);dots.push(d);
  var t=document.createElementNS(NS,"text");t.setAttribute("x",cx);t.setAttribute("y",cy+30);t.setAttribute("class","num");t.textContent=i+1;pad.appendChild(t);
}
function pt(e){var b=pad.getBoundingClientRect();return[(e.clientX-b.left)*300/b.width,(e.clientY-b.top)*300/b.height];}
function hit(p){for(var i=0;i<9;i++){var dx=p[0]-C[i%3],dy=p[1]-C[Math.floor(i/3)];if(dx*dx+dy*dy<30*30)return i;}return -1;}
function add(i){
  if(seq.indexOf(i)>-1)return;
  if(seq.length){
    var a=seq[seq.length-1],ar=Math.floor(a/3),ac=a%3,br=Math.floor(i/3),bc=i%3;
    if((ar+br)%2===0&&(ac+bc)%2===0){var m=((ar+br)/2)*3+(ac+bc)/2;if(m!==a&&m!==i&&seq.indexOf(m)<0)mark(m);}
  }
  mark(i);
}
function mark(i){seq.push(i);dots[i].setAttribute("class","dot on");rings[i].setAttribute("class","ring on");}
function draw(extra){
  var s=seq.map(function(i){return C[i%3]+","+C[Math.floor(i/3)];});
  if(extra)s.push(extra[0]+","+extra[1]);
  trail.setAttribute("points",s.join(" "));
}
function reset(){clearInterval(timer);seq=[];draw();for(var i=0;i<9;i++){dots[i].setAttribute("class","dot");rings[i].setAttribute("class","ring");}}
pad.addEventListener("pointerdown",function(e){reset();drawing=true;pad.setPointerCapture(e.pointerId);var p=pt(e),h=hit(p);if(h>-1)add(h);draw(p);hint.textContent="Drawing…";e.preventDefault();});
pad.addEventListener("pointermove",function(e){if(!drawing)return;var p=pt(e),h=hit(p);if(h>-1)add(h);draw(p);});
function finish(){
  if(!drawing)return;drawing=false;draw();
  if(seq.length<4){hint.textContent="Too short. Connect at least 4 dots.";out.innerHTML='<p class="empty">Android needs a pattern of 4 dots or more. Try again.</p>';return;}
  hint.textContent="Pattern detected.";analyze(seq.map(function(i){return i+1;}));
}
pad.addEventListener("pointerup",finish);pad.addEventListener("pointercancel",finish);
document.getElementById("clear").onclick=function(){reset();hint.textContent="Press and drag across the dots. Connect at least 4.";out.innerHTML='<p class="empty">Your analysis will appear here after you draw a pattern.</p>';};
document.getElementById("replay").onclick=function(){
  if(seq.length<4)return;var full=seq.slice();reset();var k=0;
  timer=setInterval(function(){if(k>=full.length){clearInterval(timer);return;}mark(full[k]);draw();k++;},350);
};
var SHAPES={"1,2,3,5,7,8,9":"Z shape","3,2,1,5,9,8,7":"S shape","1,4,7,8,9":"L shape","7,4,1,2,3":"Inverted U (top arch)","1,4,7,8,9,6,3":"U shape","3,2,1,4,7,8,9":"C shape","7,4,1,5,9,6,3":"N shape","1,2,3,6,9":"Reverse L","1,5,9":"Diagonal","7,5,3":"Diagonal","1,2,3,6,5,4,7,8,9":"Snake (reading order zigzag)","1,4,7,8,5,2,3,6,9":"Snake (column zigzag)","1,2,3,4,5,6,7,8,9":"Reading order","2,5,8":"Middle column","4,5,6":"Middle row"};
var TOTAL={4:1624,5:7152,6:26016,7:72912,8:140704,9:140704};
function analyze(p){
  var n=p.length,notes=[],score=Math.min(60,(n-3)*10),turns=0,jumps=0,adj=0,i;
  var xy=function(v){return[(v-1)%3,Math.floor((v-1)/3)];};
  var prev=null;
  for(i=1;i<n;i++){
    var a=xy(p[i-1]),b=xy(p[i]),dx=b[0]-a[0],dy=b[1]-a[1];
    if(Math.abs(dx)+Math.abs(dy)===3)jumps++;
    if(Math.abs(dx)<=1&&Math.abs(dy)<=1)adj++;
    var dir=dx+","+dy;if(prev!==null&&prev!==dir)turns++;prev=dir;
  }
  score+=Math.min(15,turns*3)+Math.min(15,jumps*5);
  var key=p.join(","),rev=p.slice().reverse().join(","),shape=SHAPES[key]||SHAPES[rev]||null;
  var inc=p.every(function(v,j){return j===0||v>p[j-1];}),dec=p.every(function(v,j){return j===0||v<p[j-1];});
  var corner=[1,3,7,9].indexOf(p[0])>-1;
  if(shape){score-=25;notes.push(["bad","Looks like a well-known shape: "+shape+". Shapes and letters are the first thing guessers try."]);}
  if((inc||dec)&&!shape){score-=15;notes.push(["bad","Numbers only go "+(inc?"up":"down")+" in the grid, like reading order. This is easy to guess."]);}
  if(corner){score-=5;notes.push(["mid","It starts at a corner (dot "+p[0]+"). Most people start in a corner, usually the top-left."]);}else notes.push(["ok","It does not start at a corner, which makes it less predictable."]);
  if(n<6)notes.push(["bad","Only "+n+" dots. Patterns with 6 or more dots are much harder to guess."]);else if(n>=8)notes.push(["ok","Long pattern ("+n+" dots)."]);
  if(jumps>0)notes.push(["ok",jumps+" long jump"+(jumps>1?"s":"")+" between far-apart dots add unpredictability."]);
  if(adj===n-1)notes.push(["mid","Every move goes to a neighbouring dot. Smooth, flowing patterns are more common."]);
  if(turns<=1)notes.push(["bad","Almost no change of direction."]);
  score=Math.max(0,Math.min(100,Math.round(score)));
  var lab,col;if(score<35){lab="Weak";col="var(--bad)";}else if(score<55){lab="Fair";col="var(--mid)";}else if(score<75){lab="Good";col="var(--accent)";}else{lab="Strong";col="var(--ok)";}
  var h='<div class="big"><span class="score" style="color:'+col+'">'+score+'</span><span class="label" style="color:'+col+'">'+lab+'</span></div><div class="bar"><i style="background:'+col+'"></i></div>';
  h+='<dl><dt>Detected sequence</dt><dd class="seq">'+p.join(" → ")+'</dd><dt>Dots used</dt><dd>'+n+' of 9</dd><dt>Start dot</dt><dd>'+p[0]+(corner?" (corner)":"")+'</dd><dt>Direction changes</dt><dd>'+turns+'</dd><dt>Shape match</dt><dd>'+(shape||"No common shape found")+'</dd><dt>Search space</dt><dd>1 of '+TOTAL[n].toLocaleString("en-US")+' possible '+n+'-dot patterns</dd></dl>';
  h+='<h2>What affects this score</h2><ul>'+notes.map(function(x){var c=x[0]==="bad"?"var(--bad)":x[0]==="mid"?"var(--mid)":"var(--ok)";return '<li style="list-style-color:'+c+'">'+x[1]+'</li>';}).join("")+'</ul>';
  h+='<h2>Tip</h2><p class="empty">Use 7 or more dots, start away from the corners and include a couple of long jumps. For the best protection use a PIN or password instead of a pattern.</p>';
  out.innerHTML=h;
  var bar=out.querySelector(".bar i");requestAnimationFrame(function(){bar.style.width=score+"%";});
}
})();
