CommunityApp.lang = (function () {

    var setPreferredLanguage = function (onLanguageChange) {
        var pickedLang;
        if (navigator && navigator.globalization)
        {
            navigator.globalization.getPreferredLanguage(
                function (language) {
                    console.log("navigation lang: " + language.value);
                    CommunityApp.session.save("lang", language.value);
                    pickedLang = language.value;
                    onLanguageChange(pickedLang);
                },
                function () {
                    console.error('Error getting language\n');
                });
        }
        else
        {
            pickedLang = "en-US";
            CommunityApp.session.save("lang", "en-US");
            onLanguageChange(pickedLang);
        }
    };

    return {
        setPreferredLanguage: setPreferredLanguage
    };
})();