# Dynamic Image - firebase

Dynamic Image : http://jacklehamster.github.io/firebase/dynamic-image

Produces a placeholder for an image shared by everyone that can be added on any website. It changes dynamically depending on whoever uploaded an image last

Source code: https://github.com/jacklehamster/firebase/tree/gh-pages/dynamic-image

_______

This script is one of the simplest one.
The user uploads an image, which gets translated to Base64 string (data-uri).
The data-uri then gets stored in Firebase, at a location that's hashed by the current URL. That way, any image that refers to that same URL will be updated automaticaly and immediately.

When selecting the URL where to host the image, we can simply change to another URL using the # query.
For example:
http://jacklehamster.github.io/firebase/dynamic-image#pizza
will be a different image than
http://jacklehamster.github.io/firebase/dynamic-image#penguin
