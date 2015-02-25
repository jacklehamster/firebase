/************************************************
 * IMAGE READER
 * **********************************************/
 
function attachFirebase(firebaseLocation,image) {
   var firebase = new Firebase(firebaseLocation);
   firebase.on('value',
      function(snapshot) {
         var o = snapshot.val();
         image.src = o;
      }
   );
}

window.addEventListener(e,
   function(e) {
      e.target.removeEventListener(e.type,arguments.callee)
      console.log(e);
   }
);
