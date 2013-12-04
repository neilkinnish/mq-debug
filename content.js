// Some original elements of this script are courtesy of Tyler Gaw @thegaw http://tylergaw.com/articles/reacting-to-media-queries-in-javascript
// Slightly updated and adjusted for a chrome extension and switched to ajax load to handle cross site scripting by Neil Kinnish @neiltak

(function () {
    var mqEvents = function (mediaChangeHandler) {
        var sheets = document.styleSheets;
        var _mqDebugQueriesFound = false;
        var styleFiles = [];
        var styleSheets = [];
        var mqs = {};

        for (var s in sheets)
        {
            if (sheets[s].href != undefined)
                styleFiles.push(sheets[s].href);
        }

        // This implementation is quick and dirty - sorry
        var xmlhttp = new XMLHttpRequest();

        for (var i in styleFiles)
        {
            var href = styleFiles[i];

            if (href != undefined)
            {
                xmlhttp.open("GET", href, false);
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState==4) {

                        var styleSheet = null;

                        for (var s in sheets)
                        {
                            if (sheets[s].href === href)
                                styleSheet = sheets[s];
                        }

                        var regExp = /@media(.*?){/igm; // could be improved to negate the need for replace below
                        var matches = xmlhttp.responseText.match(regExp);

                        if (matches)
                            _mqDebugQueriesFound = true;

                        for(var a in matches)
                        {
                            var txt = matches[a].replace('@media','').replace('{','');
                            var found = false;

                            if (mqs[txt])
                                continue;

                            mqs[txt] = txt;
                            var mql = window.matchMedia(txt);
                            console.log("Found: " + txt);
                            mql.addListener(mediaChangeHandler);
                            mediaChangeHandler(mql);
                        }
                    }
                }

                xmlhttp.send();
            }
        }

        if (!_mqDebugQueriesFound) {
            console.error("No Media Queries could be found");
            var _mqDebugMsg = document.getElementById('mqEventsCondition');
            _mqDebugMsg.innerHTML = 'No Media Queries found!';
        }
    }

    window.mqEvents = mqEvents;
}());

var _mqDebugDiv = document.createElement('div');
_mqDebugDiv.id = 'mqEventsCondition';

// This is nasty, but hey...
_mqDebugDiv.setAttribute('style', 'font-size:10px;font-family:monospace;text-transform:uppercase;position:fixed;bottom:20px;left:20px;background-color:black;color:white;border:1px solid white;padding:3px 8px 5px 8px;z-index:9999;');

var _mqDebugMsg = document.getElementById('mqEventsCondition');

var handleMediaChange = function (mql) {
    if (mql.matches) {
        _mqDebugDiv.innerHTML = 'MQ: ' + mql.media;
    } else {
        _mqDebugDiv.innerHTML = 'MQ: ' + mql.media;
    }
};

if (_mqDebugMsg) {
    console.log("Removed MQ debug");
    _mqDebugMsg.parentElement.removeChild(_mqDebugMsg);
    window.mqEvents = null; // Better way?
} else {
    document.getElementsByTagName('body')[0].appendChild(_mqDebugDiv);
    console.log("Started MQ debug");
    mqEvents(handleMediaChange);
}