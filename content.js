// Some original elements of this script are courtesy of Tyler Gaw @thegaw http://tylergaw.com/articles/reacting-to-media-queries-in-javascript
// Slightly updated and adjusted for a chrome extension and switched to ajax load to handle cross site scripting by Neil Kinnish @neiltak

(function () {

    var _mqDebugDiv = document.createElement('div'), _mqDebugTimer;
    _mqDebugDiv.id = 'mqEventsCondition';
    _mqDebugDiv.setAttribute('style', 'font-weight:normal !important;margin-right:10px !important;transition: all 1s ease !important;border:none !important;background-image:none !important;background-color:red !important;font-size:11px !important;font-family:monospace !important;text-transform:uppercase !important;position:fixed !important;bottom:10px !important;left:10px !important;color:white !important;padding:5px !important;z-index:9999 !important;');

    var handleMediaChange = function (mql) {
        _mqDebugDiv.setAttribute('style', 'font-weight:normal !important;margin-right:10px !important;transition: all 1s ease !important;border:none !important;background-image:none !important;background-color:red !important;font-size:11px !important;font-family:monospace !important;text-transform:uppercase !important;position:fixed !important;bottom:10px !important;left:10px !important;color:white !important;padding:5px !important;z-index:9999 !important;');

        if (mql.matches) {
            clearTimeout(_mqDebugTimer)
            _mqDebugDiv.innerHTML = mql.media;
            _mqDebugTimer = setTimeout(function() { 
                _mqDebugDiv.setAttribute('style', 'font-weight:normal !important;margin-right:10px !important;transition: all 1s ease !important;border:none !important;background-image:none !important;background-color:black !important;font-size:11px !important;font-family:monospace !important;text-transform:uppercase !important;position:fixed !important;bottom:10px !important;left:10px !important;color:white !important;padding:5px !important;z-index:9999 !important;');
            }, 400);
        }
    };

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

                            if (mqs[txt])
                                continue;

                            mqs[txt] = txt;
                            var mql = window.matchMedia(txt);

                            if (mql.media != "print") {
                                console.log("Found: " + mql.media);
                                mql.addListener(mediaChangeHandler);
                                mediaChangeHandler(mql);
                            }
                        }
                    }
                }

                xmlhttp.send();
            }
        }

        if (!_mqDebugQueriesFound) {
            console.error("No Media Queries could be found");
            _mqDebugDiv.innerHTML = 'No Media Queries found!';
        }
    };

    window.mqEvents = mqEvents;
    var _mqDebugMsg = document.getElementById('mqEventsCondition');

    if (_mqDebugMsg) {
        console.log("Removed MQ debug");
        _mqDebugMsg.parentElement.removeChild(_mqDebugMsg);
        window.mqEvents = null; // Better way?
    } else {
        document.getElementsByTagName('body')[0].appendChild(_mqDebugDiv);
        console.log("Started MQ debug");
        mqEvents(handleMediaChange);
    }

}());