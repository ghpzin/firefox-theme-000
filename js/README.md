# JS

## TITLE_ADD_HSL.JS

Script for getting tab colors from url. 

Works by getting colors from hardcoded domain/hsl dictionary `hslFromDomainDict` inside script itself or dominant color of page favicon (if it's possible to get it). 

Then codifies HSL values into 3 symbols from 3 distinct lists and adds them to the end of page `title` element (with 1 extra symbol that looks like whitespace before the other 3).

By default title changes are monitored by `MutationObserver` that adds HSL symbols back to page `title` element if it changed and there's no special symbol inside current `title` text (whitespace looking symbol before other 3). Enabled/disabled with `titleChangeObserverEnabled`.

By default there's also another `MutationObserver` that monitors `title` element addition, it adds HSL symbols when it happens and points previous `MutationObserver` to monitor changes on that new `title` element (as previous one was deleted). This `MutationObserver` is necessary as there are some pages that instead of changing text inside `title` element replace it altogether (like github). Enabled/disabled with `titleAddObserverEnabled`.

There's also an option to enable interval, that will check and update `title` text with HSL symbols if necessary. That way it's possible to limit updates to some number per period (e.g. only check and update `title` if necessary every 1 second). Check period is changed with `titleChangeCheckIntervalDelay`. Enabled/disabled with `titleChangeCheckIntervalEnabled`. Disabled by default. Most likely unnecessary to enable with 2 other observers enabled, thought may be an option to replace `titleAddObserver` or both for potentially better performance.

Other options to change are at the top of the script under `OPTIONS` and have comments for their general purposes.

Changing variables like `hSymbolCount` and similar below it is not recommended as it should only be done with changes inside css.

There is a section `DEBUG_OPTIONS` with variables for debug purposes, disabled by default. Can be used to enable helping `console.log` messages.

Changing anything below `SCRIPT_VARIABLES` is not reccomended as main logic start from there.