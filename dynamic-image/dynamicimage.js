/************************************************
 * DYNAMIC IMAGE
 * **********************************************/
var firebase = new Firebase('https://dynamic-image.firebaseio.com/images/');

var node = null, inited = false, href = null;

/**
 * init - Initialize on load
 * */
function init() {
   inited = false;
   if(node) {  // remove previous listener
      node.off('value', valueChanged);
      setImage("");
   }
   href = window.location.toString();
   var hash = CryptoJS.MD5(href)+"";
   //  the Firebase location uses MD5 to get a unique path, which depends on the current URL
   var loc = [hash.slice(0,12),
              hash.slice(12,24),
              hash.slice(24,36)].join("/");
   node = firebase.child(loc);
   node.on('value', valueChanged);  // refresh whenever its value changes
   var img = document.getElementById("img");
   img.title = img.alt = "Upload an image @ " + href;
   img.setAttribute("firebase-path",firebase.child("loc").path.toString())
   document.title = "Dynamic image @ " + href;
}

window.onhashchange = init;
window.onload = init;

/**
 * valueChanged - The Firebase data has been changed. Refresh the image
 * */
function valueChanged(snapshot) {
   var o=snapshot.val();
   if(o) {
      setImage(o.src);
   }
}

/**
 * setImage - Sets the URL of the image. Note that src is going to be a data-uri
 * */
function setImage(src) {
      document.getElementById("img").src = src;
}

/**
 * performClick - When clicking the image, fake a click on the browse button
 * */
function performClick(elemId) {
   var elem = document.getElementById(elemId);
   if(elem && document.createEvent) {
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
   }
}

/**
 * readURL - reads the bytes from the uploaded image, and send to Firebase
 * */
function readURL(input) {
   if (input.files && input.files[0]) {
       var reader = new FileReader();
       reader.onload = function (e) {
         var src = e.target.result; // src id a data-uri
         setImage(src); // refresh image immediately for instant feedback
         node.child("src").set(src);
         node.child("changed").set(new Date().toString());  // just so I know what just got modified when looking at Forge
         if(!inited) {
            node.child("href").set(href); // just so I know what image belongs to which website when looking at Forge
         }
       };
       reader.readAsDataURL(input.files[0]);
   }
}
