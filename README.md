# Romantic Birthday Interactive Website

This is a standalone romantic birthday page with:

- A soft pink collage layout
- Floating heart animations
- A clickable birthday cake animation
- Webcam gesture controls using MediaPipe Hands

## Run locally

For webcam gestures, open the site through `localhost` instead of `file://`.

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## How to use

- Click `Start the magic` or wave your hand to begin the celebration
- Click `Show the cake`, tap the cake area, or give a thumbs up to reveal the cake
- Click any collage photo to replace it with your own image

## Notes

- The hand gesture scripts load from jsDelivr at runtime, so internet access is needed for webcam gesture detection.
- If camera permission is denied, the page still works with the touch and click interactions.
