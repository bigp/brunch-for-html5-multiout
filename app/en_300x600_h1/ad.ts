/// <reference path="../../vendor/common/common.ts"/>

var sprites:any = {};

class Ad {
    constructor() {
        defaults.hidden = true;
        defaults.attachTo = id("animation");

        TweenMax.ticker.fps(30);

        sprites.background = makeSprite("background");
        sprites.leaf = makeSprite("leaf");
        sprites.text1 = makeSprite("text1");
        sprites.text2 = makeSprite("text2");
        sprites.headline = makeSprite("headline");
        sprites.logo = makeSprite("logo");
        sprites.cta = makeSprite("cta");
    }

    play(t) {
        //FRAME 1
        show([sprites.background]);
        fadeIn(0.5, sprites.logo);
        fadeIn(1, sprites.text1);
        wait(0.5);
        fadeIn(1, sprites.headline);
        wait(2);
        fadeOut(1, [sprites.text1, sprites.headline]);

        //FRAME 3
        t.addLabel("frame-3");
        t.set(sprites.leaf, {scale: 2});
        t.to(sprites.leaf, 1, {scale: 1, alpha: 1, ease: Cubic.easeOut});

        fadeIn(1, sprites.text2, "frame-3+=0.5");
        fadeIn(1, sprites.cta, "frame-3+=0.8");

        //t.timeScale(2);
    }
}