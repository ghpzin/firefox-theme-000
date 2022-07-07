# firefox-theme-000

## SCREENSHOTS

<img src="https://github.com/ghpzin/firefox-theme-000/blob/main/screenshots/theme_01.png">

## DESCRIPTION

Firefox theme mainly with black background and high contrast white/colored foreground elements.

For testing tab colors by url only required files to install are:

- [tab_color_vars.css](./css/userChrome/tab_color_vars.css)
- [tab_color.css](./css/userChrome/tab_color.css)
- [title_add_hsl.js](./js/title_add_hsl.js)

(css files need to be imported in userChrome.css, [title_add_hsl.js](./js/title_add_hsl.js) need to be run from inside userscript extension)

## INSTALLATION

### CSS

Files inside  [css](./css/) folder need to be copied to chrome folder inside your firefox profile. 

Theming with css needs to be enabled and work (same way as normal userChrome.css).

Files inside [userContent](./css/userContent/) folder may need a changed uuid for extension at the top to work.

### JS

Files inside [js](./js/) need to be installed and run from userscript extension.
Currently only tested running from FireMonkey extension.

Without [title_add_hsl.js](./js/title_add_hsl.js) file installed and running tabs won't have individual colors based on hardcoded domains (inside script) or favicons.

## OPTIONS

[CSS](./css/)

[JS](./js/)

## TODO

### <u>[js/title_add_hsl.js](./js/title_add_hsl.js)</u>

(A) Rewrite getFavicon and getHslFromFavicon to use GM.xmlHttpRequest, so there are no CORS issues

(B) Add save/load option for colors found from favicon as they tend not to change on same domain that frequently (most likely with GM.setValue/GM.getValue)

(C) Think over priorities of possible favicon urls in faviconUrlStack

(D) Rewrite parts used from ColorThief, so there are no dependencies

### <u>[css/usercontent/sidebery.css](./css/usercontent/sidebery.css)</u>

(A) Fix issues with favicon opacity on child-count (opacity is different than on normal tabs).

(B) Rewrite hover and selected indicators, so they have black and white parts and are more visible on light background.
