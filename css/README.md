# CSS

## USERCHROME

### USERCHROME.CSS

Consists of imports of other .css files from [userChrome](./css/userChrome/) folder. 

To disable part comment out import line with `/**/`.

### USERCHROME/THEME_VARS.CSS

Main theme variables.

### USERCHROME/TAB_COLOR_VARS.CSS

Contains rules for codified HSL values from symbols in tab title. Converts each special predefined symbol from tab title to 1 predefined part of HSL color.

### USERCHROME/TAB_COLOR.CSS

Contains options and rules for tab colors, including css rules to combine HSL color from 3 parts into 1 color and display tab background based on that color.

### USERCHROME/THEME.CSS

Other theme changes based on `theme_vars.css`.

### USERCHROME/CONTEXT_MENU

Contains rule to delete extra options from context menu and change context menu appearence.

### USERCHROME/SIDEBAR

Contains rules to change sidebar appeareance.

### USERCHROME/MISC

Miscellaneous fixes and changes.

## USERCONTENT

### USERCONTENT.CSS

Consists of imports of other .css files from [userContent](./css/userContent/) folder.

To disable part comment out import line with `/**/`.

### USERCONTENT/SIDEBERY.CSS

Style for Sidebery extension. Adds same colors from tab urls to items in Sidebery sidebar and changes theme colors.

Most options to change are at the top of the file.