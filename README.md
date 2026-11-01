# Phone Unlock Pattern Detection

A small web app that detects an Android-style unlock pattern drawn on a 3x3 grid and rates how hard it is to guess.

## Features

- Draw a pattern with mouse or touch (the middle dot is auto-connected, like on Android)
- Detects the exact dot sequence, for example 1 -> 2 -> 3 -> 6 -> 9
- Recognises common shapes such as Z, L, C, N and S
- Gives a strength score from 0 to 100 (Weak, Fair, Good, Strong)
- Shows how many possible patterns exist for the same number of dots
- Replay and Clear buttons, dark mode, works on mobile

## Project structure

    pattern-detection/
    |-- index.html      page structure
    |-- css/
    |   `-- style.css   all styling
    |-- js/
    |   `-- app.js      pattern drawing and analysis logic
    |-- .gitignore
    `-- README.md

## Run it

No install needed. Open `index.html` in any browser.

## Live demo

https://arsh1277.github.io/Phone-Unlock-Pattern-Detection/

## Note

This is a learning project. Nothing you draw is saved or sent anywhere.
