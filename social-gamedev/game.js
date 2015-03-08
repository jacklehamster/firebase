window.addEventListener("load",initGame);

var dok;
function initGame() {
  dok = createSprite(dobukiDataURI);
  dok.style.position = "absolute";
  dok.readonly = true;
  dok.pos = {x:0,y:0};
  document.getElementById("screen").appendChild(dok);
}
