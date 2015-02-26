/************************************************
 * IMAGE READER
 * **********************************************/
 
function attachFirebase(image,firebaseLocation) {
   image.firebase = new Firebase(firebaseLocation);
   image.firebase.on('value',
      image.firebasrRefresh = function(snapshot) {
         var o = snapshot.val();
         image.src = o;
      }
   );
}

function detachFirebase(image) {
   if(image.firebase && image.firebasrRefresh) {
    image.firebase.off('value',image.firebasrRefresh);
    delete image.firebase;
    delete image.firebaseRefresh;
   }
}

function loadFirebase(image,firebaseLocation) {
   var firebase = new Firebase(firebaseLocation);
   firebase.once('value',
      function(snapshot) {
         var o = snapshot.val();
         image.src = o;
      }
   );
}

window.addEventListener("load",
   function(e) {
      var imgs = document.getElementsByClassName("firebase-img");
      for(var i=0;i<imgs.length;i++) {
       var img = imgs[i];
       var locationAttribute = img.attributes['firebase-src'];
       if(locationAttribute)
          attachFirebase(img,locationAttribute.value);
      }
   }
);
