CommunityApp.utilities = (function () {

    String.format = function () {
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }

        return s;
    };

    String.contains = function (original, term) {
        return original.indexOf(term) >= 0;
    };

    urlExists = function (url) {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status != 404;
    };

    var getWords = function (str, words) {
        var totalWords = str.split(/\s+/).length;
        return totalWords > words ? str.split(/\s+/).slice(0, words).join(" ") + " ..." : str;
    };

    var getChars = function (str, characters) {
        return str.length > characters ? str.substr(0, characters) + " ..." : str;
    };

    var isLongerThanWords = function (str, words) {
        var totalWords = str.split(/\s+/).length;
        return totalWords > words;
    };

    var isLongerThanChars = function (str, characters) {
        return str.length > characters;
    };

    var areEqual = function (otherJson, newJson) {
        for (var key in otherJson) { if (otherJson[key] != newJson[key]) { return false; } }
        return true;
    };

    function setCaretAtEnd(elem) {
        var elemLen = elem.value.length;
        if (document.selection) {
            elem.focus();
            var oSel = document.selection.createRange();
            oSel.moveStart('character', -elemLen);
            oSel.moveStart('character', elemLen);
            oSel.moveEnd('character', 0);
            oSel.select();
        }
        else if (elem.selectionStart || elem.selectionStart == '0') {
            elem.selectionStart = elemLen;
            elem.selectionEnd = elemLen;
            elem.focus();
        } 
    }

    var removeLastMention = function (message) {
        var lastAtPos = message.lastIndexOf("@");
        message = message.substr(0, lastAtPos - 1);
        return message;
    };

    return {
        stringFormat: String.format,
        stringContains: String.contains,
        urlExists: urlExists,
        getWords: getWords,
        isLongerThanWords: isLongerThanWords,
        getChars: getChars,
        isLongerThanChars: isLongerThanChars,
        areEqual: areEqual,
        setCaretAtEnd: setCaretAtEnd,
        removeLastMention: removeLastMention
    };
})();