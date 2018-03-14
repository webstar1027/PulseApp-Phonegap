var Multilingual = function () {
    var self = this;
    self.language = 'en';
    self.Options = '';
    self.init = function (selector) {
        SetLanguage();
        Initialize(selector);
    };

    self.i18nextOption = function () {
        SetLanguage();
        return {
            resGetPath: 'Languages/locales/__lng__.json',
            load: 'unspecific',
            fallbackLng: false,
            lng: self.language
        };
    };
  
    var SetLanguage = function () {
        var language = CommunityApp.session.load("lang");
        if (language === null) {
            CommunityApp.lang.setPreferredLanguage();
            language = CommunityApp.session.load("lang");
        }

        if (language) {
            
            var langPrefix = language.toLowerCase().split("-")[0];
            console.log('language prefix: ' + langPrefix);

            switch (langPrefix) {
                case "en":
                    self.language = "en";
                    break;
                case "es":
                    self.language = "es";
                    break;
                case "de":
                    self.language = "de";
                    break;
                case "it":
                    self.language = "it";
                    break;
                case "fr":
                    self.language = "fr";
                    break;
                case "nl":
                    self.language = "nl";
                    break;
                case "no":
                    self.language = "no";
                    break;
                case "pl":
                    self.language = "pl";
                    break;
                case "sv":
                    self.language = "sv";
                    break;
                case "fi":
                    self.language = "fi";
                    break;
                case "ja":
                    self.language = "ja";
                    break;
                case "da":
                    self.language = "da";
                    break;
                case "ko":
                    self.language = "ko";
                    break;
                default:
                    self.language = "en";
                    break;
            }
        }
        else
            language = "en";
        console.log('self.language: '+ self.language);
    };
   
    function Initialize(selector) {
        i18next.use(i18nextXHRBackend);
        i18next.init({
            'lng': 'en',
            'fallbackLng': 'en',
            backend: {
                loadPath: 'Languages/locales/{{ns}}.{{lng}}.json'
            }
        }, function () {
            i18nextJquery.init(i18next, $);
            $(selector).localize();
        });
    }
};
