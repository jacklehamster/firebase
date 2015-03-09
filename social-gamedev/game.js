var fireDoks = new Firebase('https://art-depot.firebaseio.com/dobuki/');

window.addEventListener("load",initGame);

var session = CryptoJS.MD5(new Date().getTime()+""+Math.random());
var dok;
var keys = {};
var globalFrame = 0;
var lasers = {};
var effectsOverlay;
var particles = [];
var recycleLasers = [];
var hitImages = [];
var score = 0;
var doks = {};
var doksData = {};
var dokspeed = 1;

function initGame() {
  dok = createSprite(dobukiDataURI);
  dok.style.position = "absolute";
  dok.readonly = true;
  dok.pos = {x:0,y:0};
  dok.addEventListener("enterFrame",enterFrame);
  dok.lastLaser = 0;
  dok.born = 0;
  document.getElementById("screen").appendChild(dok);
  
  effectsOverlay = document.createElement("canvas");
  effectsOverlay.width = window.innerWidth;
  effectsOverlay.height = window.innerHeight;
  effectsOverlay.style.position = "absolute";
  effectsOverlay.style.pointerEvents = "none";
  document.body.appendChild(effectsOverlay);
  
  document.addEventListener("keydown",onKey);
  document.addEventListener("keyup",onKey);
  
  fireDoks.on('value',fireDoksChanged);
  
  resetGame();
}

function resetGame() {
  score = 0;
  dok.born = globalFrame;
  updateScore();
}

function onKey(event) {
  keys[event.keyCode] = event.type=="keydown";
}

function showSplash(x,y) {
  var screenSplash = convertToScreen(x,y);
  for(var i=0;i<25;i++)
    particles.push([screenSplash.x,screenSplash.y-30,(Math.random()-.5)*30,Math.random()*-20,globalFrame]);
}

function showEffects() {
  var mainScreen = document.getElementById("screen");
  var canvas = effectsOverlay;
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#FF"+Math.floor(Math.random()*16).toString(16)+Math.floor(Math.random()*16).toString(16)+"00";
  for(var i=particles.length-1;i>=0;i--) {
    var particle = particles[i];
    var xpos = particle[0];
    var ypos = particle[1];
    var size = Math.round(2+Math.random()*4);
    ctx.fillRect(xpos,ypos,size,size);
    particle[0] += particle[2];
    particle[1] += particle[3];
    particle[3]+=3;
    if(globalFrame-particles[4]>10) {
      particles.splice(i,1);
    }
  }
  for(var i=0;i<hitImages.length;i++) {
    var hitImage = hitImages[i];
    var screenPos = convertToScreen(hitImage.pos.x,hitImage.pos.y);
    var life = 100-hitImage.hits;
    ctx.fillStyle="#FF0000";
    ctx.fillRect(screenPos.x+life-50,screenPos.y,hitImage.hits,5);
    ctx.fillStyle="#00FF00";
    ctx.fillRect(screenPos.x-50,screenPos.y,life,5);
  }
}

function hit(img) {
  if(!img.hits) {
    hitImages.push(img);
  }
  img.hits = Math.min(100,img.hits?img.hits+10:10);
  img.lastHit = globalFrame;
  if(img.hits>=100) {
    img.ko = true;
    img.hits = 0;
    if(img==dok) {
      img.gotoAndPlay("ko");
    }
    else {
      setAlpha(img,.2);
    }
    var index = hitImages.indexOf(img);
    hitImages.splice(index,1);
    if(img!=dok) {
      score+=100;
      updateScore();
    }
    if(img!=dok) {
      var timeout = setTimeout(
          function() {
            clearTimeout(timeout);
            delete img.ko;
            setAlpha(img,1);
          },30000
      );
    }
  }
}

function heal(img,value) {
  if(img.hits && globalFrame-img.lastHit>100) {
    img.hits--;
    if(!img.hits) {
      var index = hitImages.indexOf(img);
      hitImages.splice(index,1);
    }
  }
}

function updateScore() {
  document.getElementById("score").innerHTML = "<b>Score:</b> " + score;
}

function collide(x,y,type) {
  x = Math.round(x);
  y = Math.round(y+2);
  var dokX = Math.round(dok.pos.x), dokY = Math.round(dok.pos.y);
   for(var xx=-3;xx<=3;xx++) {
     for(var yy=-3;yy<=3;yy++) {
        var img = x+xx==dokX && y+yy==dokY? dok : map[(x+xx)+"_"+(y+yy)];
        if(img && !img.ko) {
          if(img.img) img = img.img;
          if(img.drawn && type==2 || !img.drawn && type==1) {
            showSplash(x,y);
            hit(img);
            return map[(x+xx)+"_"+(y+yy)];
          }
        }
     }
   }
   return false;
}

function fireDoksChanged(snapshot) {
  var o = snapshot.val();
  doksData = o;
}

function updateDoks() {
  //  update synchronized doks from Firebase
  for(var ses in doksData) {
    if(ses!=session) {
      var data = doksData[ses];
      var oDok = doks[ses];
      if(!oDok) {
        oDok = createSprite(dobukiDataURI);
        doks[ses] = oDok;
        oDok.session = ses;
        oDok.style.position = "absolute";
        oDok.readonly = true;
        oDok.pos = {x:data.x,y:data.y};
        oDok.goal = {x:data.x,y:data.y};
        document.getElementById("screen").appendChild(oDok);
      }
      oDok.goal.x = data.x;
      oDok.goal.y = data.y;
      var dx = oDok.goal.x-oDok.pos.x;
      var dy = oDok.goal.y-oDok.pos.y;
      var dist = Math.sqrt(dx*dx+dy*dy);
      if(dist>1) {
        oDok.pos.x += dx*dokspeed/dist;
        oDok.pos.y += dy*dokspeed/dist;
        if(oDok.label!="running")
          oDok.gotoAndPlay("running");
        if(dx*oDok.direction<1)
          oDok.setDirection(oDok.direction);
      }
      else {
        if(oDok.label!="still")
          oDok.gotoAndPlay("still");
      }
    }
  }
}

function enterFrame() {
  if(editMode)
    return;
  globalFrame++;
  var doUpdateScreen = false;
  
  if(!dok.ko) {
    var dx = 0, dy = 0;
    if(keys[37]) dx--;  //  left
    if(keys[39]) dx++;  //  right
    if(keys[38]) dy--;  //  up
    if(keys[40]) dy++;  //  down
    
    if(dx) {
      dok.setDirection(dx);
    }
    
    if(dx!=0 || dy!=0) {
      if(dok.label!="running")
        dok.gotoAndPlay("running")
      var dist = Math.sqrt(dx*dx+dy*dy);
      dok.pos.x += dx/dist*dokspeed;
      dok.pos.y += dy/dist*dokspeed;
      doUpdateScreen = true;
    }
    else {
      if(dok.label!="still")
        dok.gotoAndPlay("still");
    }
    
    //  shoot laser
    if(keys[32]) {  //  space bar
      if(globalFrame-dok.lastLaser>5) {
        shootLaserBeam(dok.pos.x,dok.pos.y,dok.direction,2);
      }
    }
  }
  
  //  handle lasers
  for(var i in lasers) {
    var laser = lasers[i];
    laser.pos.x += laser.direction*(laser.type==2?4:3);
    
    if(globalFrame-laser.born>50 || collide(laser.pos.x,laser.pos.y,laser.type)) {
      laser.parentElement.removeChild(laser);
      delete lasers[i];
      recycleLasers.push(laser);
    }
    doUpdateScreen= true;
  }
  
  //  handle AI agressivity
  if(globalFrame-dok.born>100)
    handleAI();

  //  heal images
  for(var i=hitImages.length-1;i>=0;i--) {
    heal(hitImages[i]);
  }
  
  //  scroll to dok
  if(!editMode) {
    shiftX += ((dok.pos.x-shiftX)/5);
    shiftY += ((dok.pos.y-shiftY)/5);
    doUpdateScreen = true;
  }
  
  showEffects();  
  
  updateDoks();
  
  if(doUpdateScreen)
    updateScreen();
}

function handleAI() {
  var imgs = document.getElementById("screen").children;
  for(var i=0;i<imgs.length;i++) {
    var img = imgs[i];
    var tag = img.tagName.toLowerCase();
    if(img.drawn && img.firebase && !img.ko) {
      img.agressivity = (img.agressivity?img.agressivity+1:1);
      if(img.agressivity>Math.max(5,30-score/100)) {
        var dir = Math.random()<.5?-1:1;
        shootLaserBeam(img.pos.x+dir*2,img.pos.y,dir,1);
        img.agressivity = 0;
      }
    }
  }
}

function shootLaserBeam(x,y,direction,type) {
  dok.lastLaser = globalFrame;
  var img = recycleLasers.length?recycleLasers.pop():new Image();
  img.id = ""+Math.random();
  img.born = globalFrame;
  img.type = type;
  img.src = type==2?beamDataURI2:beamDataURI;
  img.style.position = "absolute";
  img.direction = direction;
  img.pos = {x:x,y:y-3+Math.random()};
  img.readonly= true;
  lasers[img.id] = img;
  document.getElementById("screen").appendChild(img);
}
