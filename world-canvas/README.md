# World Canvas

World Canvas : http://jacklehamster.github.io/firebase/world-canvas

An infinitely large shared whiteboard that updates in real time

Source code: https://github.com/jacklehamster/firebase/tree/gh-pages/world-canvas

______

This is a real-time collaborative drawing program with the following features:
- drawing
- moving canvas and zooming
- eyedrop and color palette.
- real time collaboration: Users can see other users' strokes unfolding as they draw.

It is virtually infinite. The canvas is divided as a grid of 200x200 cells, and each cell is a separate Firebase location. As we move the canvas around, revealing more cells, the Firebase data gets loaded further and we end up with more drawings.

Note that the strokes are stored in Firebase, not the bitmap itself. Eventually, the accumulation of strokes might be too much data to handle, so we'll need a progressive conversion to bitmaps.

_______
Known issues:
- Sometimes, we get sudden line artifacts as soon as we start drawing. It seems like the last stroke command of pen-up is not recorded correctly.
