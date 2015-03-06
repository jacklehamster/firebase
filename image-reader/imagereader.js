/************************************************
 * IMAGE READER
 * **********************************************/
 
function attachFirebase(image,firebaseLocation,options) {
   if(!options)
       options = {};
   image.firebase = typeof(firebaseLocation)=="string"?new Firebase(firebaseLocation):firebaseLocation;
   image.firebase.on('value',
      image.firebaseRefresh = function(snapshot) {
         var o = snapshot.val();
         var postSplit = o.split(";");
         if(options.chrono) {
             var preSplit = image.src.split(";");
             if(postSplit.length>=3) {
                 var preTime = image.preTime ? image.preTime : 0;
                 var postTime = parseInt(postSplit[2]);
                 if((preTime - postTime + 100000)%100000 < 10000) {
                     // if preTime is after postTime by less than 10 second, discard postTime
                     return;
                 }
                 image.preTime = postTime;
             }
         }
         image.src = postSplit.slice(0,2).join(";");
         img.dispatchEvent(new Event('change'));
      }
   );
}

function detachFirebase(image) {
   if(image.firebase && image.firebaseRefresh) {
    image.firebase.off('value',image.firebaseRefresh);
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
                options.chrono = true;
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
