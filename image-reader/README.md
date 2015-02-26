# Image Reader - firebase

Image Reader : http://jacklehamster.github.io/firebase/image-reader

Just reads an image data-uri from Firebase
This simply shows and updates animage in real time, by reading a Firebase location containing a data-uri

Usage:
- Add an image that automatically syncs with Firebase: Set class="firebase-img", and set "firebase-src"=<firebase location>
Ex: 
<img class="firebase-img" width="100%" firebase-src="https://dynamic-image.firebaseio.com/images/0412c1fbf317/83c697327b6e/3d5d0d62/src">

- Make the image load only once, (so the image doesn't have to get synced in real time): Add attribute "nosync"

- Sync an image with firebase using JavaScript: call attachFirebase(image, firebaseLocation)
Ex:
attachFirebase(image, "https://dynamic-image.firebaseio.com/images/0412c1fbf317/83c697327b6e/3d5d0d62/src");

- Remove sync from an image: call detachFirebase(image)

- Load one time a firebase location into an image: call loadFirebase(image, firebaseLocation)

Source code: https://github.com/jacklehamster/firebase/tree/gh-pages/image-reader

_______


