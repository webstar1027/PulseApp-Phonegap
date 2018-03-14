CommunityApp.sounds = (function () {
    var like = function () {
        ion.sound.play("button_tiny");
    };

    var unlike = function () {
        ion.sound.play("button_click_on");
    };

    var del = function () {
        ion.sound.play("branch_break");
    };

    var post = function () {
        ion.sound.play("water_droplet");
    };

    var verify = function () {
        ion.sound.play("glass");
    };

    var suggest = function () {
        ion.sound.play("water_droplet_3");
    };

    var refresh = function () {
        ion.sound.play("snap");
    };

    var preload = function () {
        ion.sound({
            sounds: [
                {
                    name: "button_tiny",
                    volume: 0.3
                },
                {
                    name: "button_click_on",
                    volume: 0.3
                },
                {
                    name: "branch_break",
                    volume: 0.3
                },
                {
                    name: "water_droplet",
                    volume: 0.3
                },
                {
                    name: "glass",
                    volume: 0.3
                },
                {
                    name: "water_droplet_3",
                    volume: 0.3
                },
                {
                    name: "snap",
                    volume: 0.3
                }
            ],
            path: "sounds/",
            preload: true,
            multiplay: true
        });
    };

    return {
        like: like,
        unlike: unlike,
        preload: preload,
        del: del,
        post: post,
        verify: verify,
        suggest: suggest,
        refresh: refresh
    };
})();