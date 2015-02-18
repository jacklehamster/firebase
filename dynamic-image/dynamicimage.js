var firebase = new Firebase('https://dynamic-image.firebaseio.com/images/');

var node = null, inited = false, href;

function init() {
   inited = false;
   if(node) {
      node.off('value', valueChanged);
      setImage("");
   }
   href = window.location.toString();
   var hash = CryptoJS.MD5(href)+"";
   var loc = [hash.slice(0,12),
              hash.slice(12,24),
              hash.slice(24,36)].join("/");
   node = firebase.child(loc);
   node.on('value', valueChanged);
   var img = document.getElementById("img");
   img.title = img.alt = "Upload an image @ " + href;
   document.title = "Dynamic image @ " + href;
}

window.onhashchange = init;
window.onload = init;


function valueChanged(snapshot) {
   var o=snapshot.val();
   if(o) {
      setImage(o.src);
   }
}

function setImage(src) {
      document.getElementById("img").src = src;
}

function performClick(elemId) {
   var elem = document.getElementById(elemId);
   if(elem && document.createEvent) {
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
   }
}

function readURL(input) {
   if (input.files && input.files[0]) {
       var reader = new FileReader();
       reader.onload = function (e) {
         var src = e.target.result;
         setImage(src);
         node.child("src").set(src);
         node.child("changed").set(new Date().toString());
         if(!inited) {
            node.child("href").set(href); 
         }
       };
       reader.readAsDataURL(input.files[0]);
   }
}
