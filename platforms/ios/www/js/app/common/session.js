CommunityApp.session = (function () {
    var currentUser = {
        id: 0,
        username: "",
        save: function (id, username) {
            this.id = id;
            this.username = username;
            save("userSession", currentUser);
        },
        load: function () {
            var loadedUser = load("userSession");

            if (loadedUser) {
                currentUser.id = loadedUser.id;
                currentUser.username = loadedUser.username;
            }

            return currentUser;
        },
        remove: function () {
            remove("userSession");
        }
    };

    var accessToken = {
        token: "",
        save: function (token) {
            this.token = token;
            save("accessToken", accessToken);
        },
        load: function () {
            var loadedToken = load("accessToken");

            if (loadedToken)
            {
                accessToken.token = loadedToken.token;
            }

            return accessToken;
        },
        remove: function () {
            remove("accessToken");
        }
    };

    var save = function (key, value, temp) {
        if (temp && temp === true)
        {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
        else
        {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };

    var load = function (key, temp) {
        var loadedData;
        var rawData;

        if (temp && temp === true)
        {
            rawData = sessionStorage.getItem(key);
        }
        else {
            rawData = localStorage.getItem(key);
        }
        
        if (rawData !== null) {
            loadedData = JSON.parse(rawData);
        }

        return loadedData;
    };

    var remove = function (key, temp) {
        if (temp) {
            sessionStorage.removeItem(key);
        }
        else {
            localStorage.removeItem(key);
        }
    };

    var clear = function (persistUsername) {
        if (!persistUsername) {
            localStorage.clear();
        }
        else {
            for (var i = 0; i < localStorage.length; i++) {
                var currKey = localStorage.key(i);
                if (currKey != "persist-username" && currKey != "push_device") {
                    remove(currKey);
                }
            }
        }
    };

    return {
        currentUser: currentUser,
        accessToken: accessToken,
        clear: clear,
        save: save,
        remove: remove,
        load: load
    };
})();