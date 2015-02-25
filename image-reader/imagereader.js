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



$( document ).ready(function() {
      for(var img in $$('.firebase-src')) {
       var locationAttribute = img.attributes['firebase-src'];
       if(locationAttribute)
          attachFirebase(img,locationAttribute.src);
      }
});
