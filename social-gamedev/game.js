window.addEventListener("load",initGame);

var dok;
function initGame() {
  dok = createSprite(dobukiDataURI);
  document.body.appendChild(dok);
}
