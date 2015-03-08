window.addEventListener("load",initGame);

var dok;
function initGame() {
  dok = createSprite(dobukiDataURI);
  changeZoom(dok,.5);
  dok.pos = {0,0};
  mainScreen.appendChild(dok);
}
