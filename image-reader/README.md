# Image Reader - firebase

Image Reader : http://jacklehamster.github.io/firebase/image-reader

Just reads an image data-uri from Firebase
This simply shows and updates animage in real time, by reading a Firebase location containing a data-uri

Usage:
- Add an image that automatically syncs with Firebase: Set class="firebase-img", and set "firebase-src"=&lt;firebase location&gt;.
Ex: 
&lt;img class="firebase-img" width="100%" firebase-src="https://dynamic-image.firebaseio.com/images/0412c1fbf317/83c697327b6e/3d5d0d62/src"&gt;

- Make the image load only once, (so the image doesn't have to get synced in real time): Add attribute "nosync"

- Add the chrono features, which in pair with the firebase-cam widget, discards images that arrive later but taken before the current image (avoids creating "back in time sudden jumps" effect). It uses the trick of adding some kind of timestamp after the dataURI (;3032). If the image gets updated with a new URL that is supposed to have come less than 1 sec before the current image, it means we had race condition and the new image gets discarded. To use it: Add attribute "chrono"

- Sync an image with firebase using JavaScript: call attachFirebase(image, firebaseLocation).
Ex:
attachFirebase(image, "https://dynamic-image.firebaseio.com/images/0412c1fbf317/83c697327b6e/3d5d0d62/src");

- Remove sync from an image: call detachFirebase(image)

- Load one time a firebase location into an image: call loadFirebase(image, firebaseLocation)


Directly include library: &lt;script src="http://jacklehamster.github.io/firebase/image-reader/imagereader.js" &gt; &lt;/script&gt;


Source code: https://github.com/jacklehamster/firebase/tree/gh-pages/image-reader

_______


