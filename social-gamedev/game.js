window.addEventListener("load",initGame);

var dok;
var keys = {};
var globalFrame = 0;
var lasers = {};
var laserOverlay;
function initGame() {
  dok = createSprite(dobukiDataURI);
  dok.style.position = "absolute";
  dok.readonly = true;
  dok.pos = {x:0,y:0};
  dok.addEventListener("enterFrame",enterFrame);
  dok.lastLaser = 0;
  document.getElementById("screen").appendChild(dok);
  document.addEventListener("keydown",onKey);
  document.addEventListener("keyup",onKey);
}

function onKey(event) {
  keys[event.keyCode] = event.type=="keydown";
}

function enterFrame() {
  globalFrame++;
  var doUpdateScreen = false;
  var speed = .5;
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
    dok.pos.x += dx*speed;
    dok.pos.y += dy*speed;
    doUpdateScreen = true;
  }
  else {
    if(dok.label!="still")
      dok.gotoAndPlay("still");
  }
  
  //  shoot laser
  if(keys[32]) {  //  space bar
    if(globalFrame-dok.lastLaser>5) {
      shootLaserBeam(dok.pos.x,dok.pos.y,dok.direction);
    }
  }
  
  //  handle lasers
  for(var i in lasers) {
    var laser = lasers[i];
    laser.pos.x += laser.direction*4;
    if(globalFrame-laser.born>50) {
      laser.parentElement.removeChild(laser);
      delete lasers[i];
    }
    doUpdateScreen= true;
  }

  //  scroll to dok
  if(!editMode) {
    shiftX += (dok.pos.x-shiftX)/5;
    shiftY += (dok.pos.y-shiftY)/5;
    doUpdateScreen = true;
  }
  
  if(doUpdateScreen)
    updateScreen();
}

function shootLaserBeam(x,y,direction) {
  dok.lastLaser = globalFrame;
  var img = new Image();
  img.id = ""+Math.random();
  img.born = globalFrame;
  img.src = beamDataURI2;
  img.style.position = "absolute";
  img.direction = direction;
  img.pos = {x:x,y:y-3+Math.random()};
  img.readonly= true;
  lasers[img.id] = img;
  document.getElementById("screen").appendChild(img);
}
