window.addEventListener("load",initGame);

var dok;
function initGame() {
  dok = createSprite(dobukiDataURI);
  changeZoom(dok,.5);
  dok.pos = {x:0,y:0};
  document.getElementById("screen").appendChild(dok);
}
