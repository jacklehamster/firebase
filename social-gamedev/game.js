window.addEventListener("load",initGame);

var dok;
var keys = {};
function initGame() {
  dok = createSprite(dobukiDataURI);
  dok.style.position = "absolute";
  dok.readonly = true;
  dok.pos = {x:0,y:0};
  dok.addEventListener("enterFrame",enterFrame);
  document.getElementById("screen").appendChild(dok);
  document.addEventListener("keydown",onKey);
  document.addEventListener("keyup",onKey);
}

function onKey(event) {
  keys[event.keyCode] = event.type=="keydown";
}

function enterFrame() {
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
  
  //  scroll to dok
  if(!editMode) {
    shiftX += (dok.pos.x-shiftX)/5;
    shiftY += (dok.pos.y-shiftY)/5;
    doUpdateScreen = true;
  }
  
  if(doUpdateScreen)
    updateScreen();
}
