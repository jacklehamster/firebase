/************************************************
 * IMAGE READER
 * **********************************************/
 
function attachFirebase(image,firebaseLocation) {
   var firebase = new Firebase(firebaseLocation);
   firebase.on('value',
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
