/************************************************
 * IMAGE READER
 * **********************************************/
 
function attachFirebase(image,firebaseLocation,options) {
   if(!options)
       options = {};
   image.firebase = typeof(firebaseLocation)=="string"?new Firebase(firebaseLocation):firebaseLocation;
   image.setAttribute("firebase-src",image.firebase.ref().toString());
   
   var bytes = 0;
   var startTime = new Date().getTime();
   image.firebase.on('value',
      image.firebaseRefresh = function(snapshot) {
         var o = snapshot.val();
         if(typeof(o)!="string") return;
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
         if(options.showbandwidth) {
             var now = new Date().getTime();
             var diffTime = now - startTime;
             bytes += o.length*2;
             if(diffTime>1000) {
                 showBandwidth(image,Math.round((bytes/1000)/(diffTime/1000)*10)/10 + " Kb/s");
                 startTime = now;
                 bytes = 0;
             }
         }
         image.src = postSplit.slice(0,2).join(";");
         image.dispatchEvent(new Event('change'));
      }
   );
}

function showBandwidth(image,bandwidth) {
   var span = document.getElementById('bandwidth_overlay');
   if(!span) {
      span = document.createElement("span");
      span.id = 'bandwidth_overlay';
      span.style.position = "absolute";
      span.style.color = "blue";
      image.parentElement.insertBefore(span,image);
   }
   span.innerHTML = bandwidth;
}

function detachFirebase(image) {
   if(image.firebase && image.firebaseRefresh) {
    image.firebase.off('value',image.firebaseRefresh);
    delete image.firebase;
    delete image.firebaseRefresh;
   }
}

function loadFirebase(image,firebaseLocation) {
   var firebase = typeof(firebaseLocation)=="string"?new Firebase(firebaseLocation):firebaseLocation;
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
            options.chrono = img.attributes['chrono'];
            options.showbandwidth = img.attributes['showbandwidth'];
            
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
