# firefox-theme-000

## Description

Firefox theme mainly with black background and high contrast white/colored foreground elements.

## Installation

### css

Files inside  [css folder](./css/) need to be copied to chrome folder inside your firefox profile. 

Theming with css needs to be enabled and work (same way as normal userChrome.css).

### js

Files inside [js folder](./js/) need to be installed and run from userscript extension.
Currently only tested running from FireMonkey extension.

Without [title_add_hsl.js](./js/title_add_hsl.js) file installed and running tabs won't have individual colors based on hardcoded domains (inside script) or favicons.

## TODO

### title_add_hsl.js

(A) Rewrite getFavicon and getHslFromFavicon to use GM.xmlHttpRequest, so there are no CORS issues  

(B) Add save/load option for colors found from favicon as they tend not to change on same domain that frequently (most likely with GM.setValue/GM.getValue) 

(C) Think over priorities of possible favicon urls in faviconUrlStack

(D) Rewrite parts used from ColorThief, so there are no dependencies
