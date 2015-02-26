/************************************************
 * IMAGE READER
 * **********************************************/
 
function attachFirebase(image,firebaseLocation,options) {
   image.firebase = new Firebase(firebaseLocation);
   image.firebase.on('value',
      image.firebasrRefresh = function(snapshot) {
         var o = snapshot.val();
         if(options.chrono && options.chrono.toUpperCase()!="NO") {
             var preSplit = image.src.split(";");
             var postSplit = o.split(";");
             if(preSplit.length>=3 && postSplit.length>=3) {
                 var preTime = parseInt(preSplit[2]);
                 var postTime = parseInt(preSplit[2]);
                 if((preTime - postTime + 10000)%10000 > 1000) {
                     // if preTime is after postTime by less than a second, discard postTime
                     return;
                 }
             }
         }
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
         if(locationAttribute) {
            var options = {};
            if(img.attributes['chrono']) {
                options.chrono = img.attributes['chrono'].value;
            }
            if(img.attributes['nosync']) {
              loadFirebase(img,locationAttribute.value);
            }
            else {
               attachFirebase(img,locationAttribute.value,options);
            }
         }
      }
   }
);
