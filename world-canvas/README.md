# World Canvas

World Canvas : http://jacklehamster.github.io/firebase/world-canvas

An infinitely large shared whiteboard that updates in real time

Source code: https://github.com/jacklehamster/firebase/tree/gh-pages/world-canvas

______

This is a real-time collaborative drawing program with the following features:
- drawing
- moving canvas and zooming
- eyedrop and color palette.

It is virtually infinite. The canvas is divided as a grid of 200x200 cells, and each cell is a separate Firebase location. As we move the canvas around, revealing more cells, the Firebase data gets loaded further and we end up with more drawings.

Users can see other users' strokes unfolding as they draw.
