// ==UserScript==
// @name     3_ujs|all|title_add_hsl
// @version  3
// @author   ghpzin
// @require  https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.2/color-thief.umd.js
// @match    <all_urls>
// @run-at   document-idle
// ==/UserScript==

console.log("STARTED CUSTOM SCRIPT --- 3_ujs|all|title_add_hsl");

//─────────OPTIONS─────────

//replace HSL values, overrides any other value if set
let hReplace, sReplace, lReplace;

//default HSL values if replace, domain and favicon didn't return HSL values to set
let hslDefault = [ 30, 20, 50];

//enable partial match on domain from hslFromDomainDict
let hslFromDomainPartialMatchEnabled = true;

//enable getting HSL values from favicon
let hslFromFaviconEnabled = true;

//max duration to get hsl from favicon (1000 = 1sec)
let hslFromFaviconMaxDuration = 1000;

//accuracy of getting color from favicon, pixels to skip 1-10, 1 is the most accurate
let hslFromFaviconAccuracy = 5;

//enable interval check that adds hsl to title
let titleChangeCheckIntervalEnabled = false;

//interval check period (1000 = 1sec)
let titleChangeCheckIntervalDelay = 1000;

//enable observer that add hsl on title element change
let titleChangeObserverEnabled = true;

//enable observer that checks if title element was added, updates title and adds titleChangeObserver if it's enabled
let titleAddObserverEnabled = true;

//enable CORS proxy to fetch favicon from if necessary
let corsProxyEnabled = false;

//CORS proxy url to use if corsProxyEnabled=true
let corsProxyUrl = "";

//dictionary of HSL values per domain, key "<empty string>" for empty domains
let hslFromDomainDict = {
    "google.com":               [160,  30,  50],
    "mozilla.org":              [190,  30,  50],
    "<empty string>":           [ 50,  50,  50],
};

//count of Hue symbols from hSymbolArr used, don't change without changing userChrome.css
let hSymbolCount = 72;

//count of Saturation symbols from sSymbolArr used, don't change without changing userChrome.css
let sSymbolCount = 20;

//count of Lightness symbols from lSymbolArr used, don't change without changing userChrome.css
let lSymbolCount = 20;

//Hue symbols, don't change without changing userChrome.css
let hSymbolArr = [
  '⡀', '⡁', '⡂', '⡃', '⡄', '⡅', '⡆', '⡇', '⡈', '⡉', '⡊', '⡋', '⡌', '⡍', '⡎', '⡏',
  '⡐', '⡑', '⡒', '⡓', '⡔', '⡕', '⡖', '⡗', '⡘', '⡙', '⡚', '⡛', '⡜', '⡝', '⡞', '⡟',
  '⡠', '⡡', '⡢', '⡣', '⡤', '⡥', '⡦', '⡧', '⡨', '⡩', '⡪', '⡫', '⡬', '⡭', '⡮', '⡯',
  '⡰', '⡱', '⡲', '⡳', '⡴', '⡵', '⡶', '⡷', '⡸', '⡹', '⡺', '⡻', '⡼', '⡽', '⡾', '⡿',
  '⢀', '⢁', '⢂', '⢃', '⢄', '⢅', '⢆', '⢇', '⢈', '⢉', '⢊', '⢋', '⢌', '⢍', '⢎', '⢏'
];

//Saturation symbols, don't change without changing userChrome.css
let sSymbolArr = [
  '⢐', '⢑', '⢒', '⢓', '⢔', '⢕', '⢖', '⢗', '⢘', '⢙', '⢚', '⢛', '⢜', '⢝', '⢞', '⢟',
  '⢠', '⢡', '⢢', '⢣', '⢤', '⢥', '⢦', '⢧', '⢨', '⢩', '⢪', '⢫', '⢬', '⢭', '⢮', '⢯'
];

//Lightness symbols, don't change without changing userChrome.css
let lSymbolArr = [
  '⢰', '⢱', '⢲', '⢳', '⢴', '⢵', '⢶', '⢷', '⢸', '⢹', '⢺', '⢻', '⢼', '⢽', '⢾', '⢿',
  '⣀', '⣁', '⣂', '⣃', '⣄', '⣅', '⣆', '⣇', '⣈', '⣉', '⣊', '⣋', '⣌', '⣍', '⣎', '⣏'
];

//─────────DEBUG_OPTIONS─────────

//enable console log for debugging
let debugLogEnabled = false;

//hex background color for color preview in console.log
let debugLogBgCol = "#000000";

//string to display color preview in console.log, needs to be at least 1 char long;
let debugLogColSymb = "──███──";

//console log color before and after getHslNormalized
let debugLogNormalizeEnabled = true;

//run colorThief.getPalette from favicon and console.log results
let debugLogPaletteEnabled = true;

//count of colors to return a palette from favicon
let debugLogPaletteColCnt = 6;

//─────────SCRIPT_VARIABLES─────────

//ColorThief instance
const colorThief = new ColorThief();

//image object with favicon src for ColorThief
let faviconImage = new Image();

//stack of urls to try to load favicon from
let faviconUrlStack = [];

//flag to stop updating title from different sources (observers, timer, etc.)
let titleChangeInProgress = false;

//HSL array from favicon
let hslFromFavicon;

//flag to check if getHslFromFavicon had already run on this page
let hslFromFaviconFinished = false;

//flag to check if getHslFromFavicon got result with hsl on this page
let hslFromFaviconGotResult = false;

//timeout object for max duration of running getHslFromFavicon
let hslFromFaviconTimeout;

//hsl array from domain
let hslFromDomain;

//flag to check if getHslFromDomain had already run on this page
let hslFromDomainFinished = false;

//flag to check if getHslFromDomain got result with hsl on this page
let hslFromDomainGotResult = false;

//how to determine domainName to search hslFromDomainDict for hsl
let domainName = location.host;

//─────────FUNCTIONS─────────

//RGB to HSL converter
function rgbToHsl(r, g, b, format = true) {
  r /= 255;
  g /= 255;
  b /= 255;
  let h, s, l;
  let xMax = Math.max(r,g,b);
  let xMin = Math.min(r,g,b);
  let c = xMax - xMin;
  l = (xMax + xMin) / 2;
  if (c === 0) { h = 0;}
  else {
    switch (xMax) {
      case r:
        h = ((g-b)/c)/6;
        break;
      case g:
        h = ((b-r)/c + 2)/6;
        break;
      case b:
        h = ((r-g)/c + 4)/6;
        break;
    }
  }
  if (l === 0 || l === 1) { s = 0; }
  else {
    s = (xMax - l) / Math.min(l,1-l);
  }
  if (format) {
    return [Math.round(h*360),
            Math.round(s*100),
            Math.round(l*100)];
  }
  return [h, s, l];
}

//get HSL values, set in hslFromDomainDict based on page domainName
function getHslFromDomain() {
  if (domainName === "" && "<empty string>" in hslFromDomainDict) {
    return hslFromDomainDict["<empty string>"];
  }
  if (domainName in hslFromDomainDict) {
    hslFromDomainGotResult = true;
    return hslFromDomainDict[domainName];
  }
  if (hslFromDomainPartialMatchEnabled) {
    let partialMatch;
      Object.entries(hslFromDomainDict)
      .forEach(function([key, value]) {
        if (key.includes(domainName) || domainName.includes(key)) {
          partialMatch = value;
        }
      });
    if (typeof partialMatch !== 'undefined') {
      hslFromDomainGotResult = true;
      return partialMatch;
    }
  }
  return [];
}

//get possible favicon url from link element, borrowed from https://github.com/MrOtherGuy/color-tag-tabs/blob/main/src/ctt.js
function getFavicon() {
  let nodeList = document.getElementsByTagName("link");
  for (let i = nodeList.length - 1; i >= 0; i--) {
    let rel = nodeList[i].getAttribute("rel");
    if (/((\sicon)|(^icon))\b/i.test(rel) || (rel === "apple-touch-icon-precomposed")) {
      try {
        let img = new Image();
        img.src = nodeList[i].href;
        return nodeList[i].href;
      }
      catch (e) {
      }
    }
  }
  return "";
}

//calculate Value (as in HSV) from HSL and set Saturation/Lightness higher if Value is too low
function getHslNormalized(tmpHsl) {
  let tmpH = tmpHsl[0],
      tmpS = tmpHsl[1],
      tmpL = tmpHsl[2];
  //calculate value from saturation and lightness
  let tmpV = (tmpS / 100) * Math.min(tmpL / 100, 1 - tmpL / 100) + tmpL / 100;
  if (debugLogEnabled && debugLogNormalizeEnabled) { console.log(`Value before normalized\n${tmpV.toFixed(3)}`); }
  if (tmpV < 0.5) {
    //increase saturation to 30 if it's between 5 and 30
    tmpS = tmpS < 5 ? tmpS : tmpS > 30 ? tmpS : 30;
    //increase lightness to 50 if it's under 50
    tmpL = tmpL > 50 ? tmpL : 50;
  }
  if (debugLogEnabled && debugLogNormalizeEnabled) { console.log(`Value after normalized:\n${((tmpS / 100) * Math.min(tmpL / 100, 1 - tmpL / 100) + tmpL / 100).toFixed(3)}`); }
  return [tmpH, tmpS, tmpL];
}

//get HSL values from favicon and update title
async function getHslFromFavicon() {
  faviconImage.onload = function() {
    if (hslFromFaviconFinished) {
      faviconImage.onload = null;
      return;
    }
    let tmpRgb;
    try {
      if (debugLogEnabled) { console.log(`colorThief.getColor with src:\n${faviconImage.src}`); }
      tmpRgb = colorThief.getColor(this, hslFromFaviconAccuracy);
      if (debugLogEnabled && debugLogPaletteEnabled) {
        let pallete = colorThief.getPalette(this,debugLogPaletteColCnt,hslFromFaviconAccuracy);
        console.log("Palete from favicon:");
        for (let c = 0; c < pallete.length; c++) {
          let paletteHsl = rgbToHsl(pallete[c][0],
                                    pallete[c][1],
                                    pallete[c][2]);
          console.log(`%c${debugLogColSymb}%c${paletteHsl}`,
                      `color: hsl(${paletteHsl[0]},${paletteHsl[1]}%,${paletteHsl[2]}%);`+
                      `background: ${debugLogBgCol}`);
        }
      }
      hslFromFavicon = rgbToHsl(tmpRgb[0], tmpRgb[1], tmpRgb[2]);
      if (debugLogEnabled && debugLogNormalizeEnabled) {
        console.log(`hslFromFavicon before normalized:\n%c${debugLogColSymb}%c${hslFromFavicon}`,
                    `color: hsl(${hslFromFavicon[0]},${hslFromFavicon[1]}%,${hslFromFavicon[2]}%);`+
                    `background: ${debugLogBgCol}`);
      }
      hslFromFavicon = getHslNormalized(hslFromFavicon);
      if (debugLogEnabled && debugLogNormalizeEnabled) {
        console.log(`hslFromFavicon after normalized:\n%c${debugLogColSymb}%c${hslFromFavicon}`,
                    `color: hsl(${hslFromFavicon[0]},${hslFromFavicon[1]}%,${hslFromFavicon[2]}%);`+
                    `background: ${debugLogBgCol}`);
      }
      hslFromFaviconGotResult = true;
      hslFromFaviconFinished = true;
      faviconImage.onload = null;
      updateTitle();
      clearTimeout(hslFromFaviconTimeout);
    }
    catch(e) {
      if (debugLogEnabled) {
        console.log("error in faviconImgVar.onload:\n",e);
      }
      if (faviconUrlStack.length > 0) {
        let nextFaviconSrc = faviconUrlStack.pop();
        if(corsProxyEnabled && nextFaviconSrc.includes(corsProxyUrl)) {
          faviconImage.crossOrigin = 'Anonymous';
        }
        else if (faviconImage.crossOrigin) {
          faviconImage.removeAttribute("crossOrigin");
        }
        faviconImage.src = nextFaviconSrc;
      }
      else {
        hslFromFaviconFinished = true;
        updateTitle();
        clearTimeout(hslFromFaviconTimeout);
      }
    }
  };
  try {
    let faviconUrl = getFavicon();
    let originSplit = location.origin.split(".");
    let origin = location.origin;
    if (originSplit.length >= 3) {
      let oLen = originSplit.length;
      origin = `https://${originSplit[oLen-2]}.${originSplit[oLen-1]}`;
    }
    if (faviconUrl) {
      if (corsProxyEnabled) {
        faviconUrlStack.push(corsProxyUrl+
                             encodeURIComponent(`${origin}/favicon.ico`));
        faviconUrlStack.push(corsProxyUrl+
                             encodeURIComponent(faviconUrl));
      }
      faviconUrlStack.push("/favicon.ico");
      faviconUrlStack.push(faviconUrl);
    }
    else {
      if (corsProxyEnabled) {
        faviconUrlStack.push(corsProxyUrl+
                             encodeURIComponent(`${origin}/favicon.ico`));
      }
      faviconUrlStack.push("/favicon.ico");
    }
    if (debugLogEnabled) { console.log("faviconUrlStack:",faviconUrlStack); }
    let nextFaviconSrc = faviconUrlStack.pop();
    if(corsProxyEnabled && nextFaviconSrc.includes(corsProxyUrl)) {
      faviconImage.crossOrigin = 'Anonymous';
    }
    faviconImage.src = nextFaviconSrc;
  }
  catch(e) {
    if (debugLogEnabled) { console.log("error in getHslFromFavicon:\n",e); }
    hslFromFaviconFinished = true;
    updateTitle();
    clearTimeout(hslFromFaviconTimeout);
  }
}

//get final hsl values from possible options
function getFinalHsl() {
  let tmpHsl = [];
  tmpHsl[0] =
    typeof hReplace !== 'undefined' ?
    hReplace :
    hslFromDomainGotResult ?
    hslFromDomain[0] :
    hslFromFaviconGotResult ?
    hslFromFavicon[0] :
    hslDefault[0];
  tmpHsl[1] =
    typeof sReplace !== 'undefined' ?
    sReplace :
    hslFromDomainGotResult ?
    hslFromDomain[1] :
    hslFromFaviconGotResult ?
    hslFromFavicon[1] :
    hslDefault[1];
  tmpHsl[2] =
    typeof lReplace !== 'undefined' ?
    lReplace :
    hslFromDomainGotResult ?
    hslFromDomain[2] :
    hslFromFaviconGotResult ?
    hslFromFavicon[2] :
    hslDefault[2];
  if (debugLogEnabled) {
    let hSymbInd = Math.round(tmpHsl[0]/360*hSymbolCount),
        sSymbInd = Math.round(tmpHsl[1]/100*sSymbolCount),
        lSymbInd = Math.round(tmpHsl[2]/100*lSymbolCount);
    let hRounded = hSymbInd*360/hSymbolCount,
        sRounded = sSymbInd*100/sSymbolCount,
        lRounded = lSymbInd*100/lSymbolCount;
    let colSymbLen = debugLogColSymb.length+1;
    console.log("FINAL HSL STAT:");
    console.log(`%c${debugLogColSymb}%c`+
                `  chosen HSL: ${tmpHsl}`,
                `color: hsl(${tmpHsl[0]},${tmpHsl[1]}%,${tmpHsl[2]}%);`+
                `background: ${debugLogBgCol}`);
    console.log(`%c${debugLogColSymb}%c`+
                ` rounded HSL: ${hRounded},`+
                `${sRounded},`+
                `${lRounded}`,
                `color: hsl(${hRounded},${sRounded}%,${lRounded}%);`+
                `background: ${debugLogBgCol}`);
    console.log(" ".repeat(colSymbLen)+
                `     symbols: `+
                `${hSymbolArr[hSymbInd]}`+
                `${sSymbolArr[sSymbInd]}`+
                `${lSymbolArr[lSymbInd]}\n`+
                " ".repeat(colSymbLen)+
                `   replace H: ${typeof hReplace !== 'undefined'} ${hReplace}\n`+
                " ".repeat(colSymbLen)+
                `   replace S: ${typeof sReplace !== 'undefined'} ${sReplace}\n`+
                " ".repeat(colSymbLen)+
                `   replace L: ${typeof lReplace !== 'undefined'} ${lReplace}`);
     console.log(`${hslFromDomainGotResult?`%c${debugLogColSymb}%c`:`%c${" ".repeat(colSymbLen-1)}%c`}`+
                `  fromDomain: ${hslFromDomainGotResult} ${hslFromDomain}`,
                `${hslFromDomainGotResult ?
                `color: hsl(${hslFromDomain[0]},${hslFromDomain[1]}%,${hslFromDomain[2]}%);`+
                `background: ${debugLogBgCol}`:""}`);

    console.log(`${hslFromFaviconGotResult?`%c${debugLogColSymb}%c`:`%c${" ".repeat(colSymbLen-1)}%c`}`+
                ` fromFavicon: ${hslFromFaviconGotResult} ${hslFromFavicon}`,
                `${hslFromFaviconGotResult ?
                `color: hsl(${hslFromFavicon[0]},${hslFromFavicon[1]}%,${hslFromFavicon[2]}%);`+
                `background: ${debugLogBgCol}`:""}`);
    console.log(`%c${debugLogColSymb}%c`+
                `     default: ${hslDefault}`,
                `color: hsl(${hslDefault[0]},${hslDefault[1]}%,${hslDefault[2]}%);`+
                `background: ${debugLogBgCol}`);
  }
  return tmpHsl;
}

//update title with hsl symbols
async function updateTitle() {
  let tmpHsl = getFinalHsl();
  //first symbol after previous title is not whitespace, but U+2800 - Braille Pattern Blank
  document.title =
    `${document.title.replace(/⠀.{3}/gi, "")}⠀`+
    `${hSymbolArr[Math.round(tmpHsl[0]/360*hSymbolCount)]}`+
    `${sSymbolArr[Math.round(tmpHsl[1]/100*sSymbolCount)]}`+
    `${lSymbolArr[Math.round(tmpHsl[2]/100*lSymbolCount)]}`;
}

//main function, call functions to calculate hsl and update title
async function addHslToTitle() {
  if (titleChangeInProgress) { return; }
  titleChangeInProgress = true;

  if (!hslFromDomainFinished) {
    hslFromDomain = getHslFromDomain();
    hslFromDomainFinished = true;
  }

  let hslAllReplaced = (
    typeof hReplace !== 'undefined' &&
    typeof sReplace !== 'undefined' &&
    typeof lReplace !== 'undefined'
  );
  let hslFromDomainFound = hslFromDomain.length > 0 ;
  if (!hslAllReplaced &&
      !hslFromDomainFound &&
       hslFromFaviconEnabled &&
      !hslFromFaviconFinished ) {
    hslFromFaviconTimeout = setTimeout(function() {
      if (debugLogEnabled) { console.log("hslFromFaviconTimeout"); }
      updateTitle();
      hslFromFaviconFinished = true;
      titleChangeInProgress = false;
    }, hslFromFaviconMaxDuration);
    getHslFromFavicon();
    titleChangeInProgress = false;
  }
  else {
    updateTitle();
    titleChangeInProgress = false;
  }
}

//─────────SCRIPT_EXECUTION_START─────────

//change title on script load
addHslToTitle();

let titleChangeObserver;
//change title on title change
if (titleChangeObserverEnabled) {
  titleChangeObserver = new MutationObserver(function(mutations) {
    //symbol to check is not whitespace, but U+2800 - Braille Pattern Blank
    if (!mutations[0].target.text.includes("⠀")) {
      if (debugLogEnabled) { console.log("titleChangeObserver call addHslToTitle"); }
      addHslToTitle();
    }
  });
  titleChangeObserver.observe(document.querySelector("title"), {
    childList: true,
  });
}

//change title on adding title element to head
if (titleAddObserverEnabled) {
  const titleAddObserver = new MutationObserver(function(mutations) {
    for (let m = 0; m < mutations.length; m++) {
      if (!mutations[m].addedNodes) {
        continue;
      }
      for (let a = 0; a < mutations[m].addedNodes.length; a++) {
        if (mutations[m].addedNodes[a].nodeName === "TITLE"){
          if (debugLogEnabled) { console.log("titleAddObserver call addHslToTitle"); }
          addHslToTitle();
          if(titleChangeObserverEnabled) {
            titleChangeObserver.disconnect();
            titleChangeObserver.observe(mutations[m].addedNodes[a], {childList: true,});
          }
        }
      }
    }
  });
  titleAddObserver.observe(document.head, {
    childList: true
  });
}

//change title on interval
if (titleChangeCheckIntervalEnabled) {
  window.setInterval(function() {
    //symbol to check is not whitespace, but U+2800 - Braille Pattern Blank
    if (!document.querySelector("title").text.includes("⠀")) {
      if (debugLogEnabled) { console.log("titleChangeCheckInterval call addHslToTitle"); }
      addHslToTitle();
    }
  }, titleChangeCheckIntervalDelay);
}
