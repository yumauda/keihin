gsap.registerPlugin(ScrollTrigger);


const opening = gsap.timeline();
const singleWordTargets = document.querySelectorAll(".js-single-word");

const getOpeningLogoCenterOffset = () => {
    const logo = document.querySelector(".js-opening-logo");

    if (!logo) {
        return { x: 0, y: 0 };
    }

    const rect = logo.getBoundingClientRect();
    const logoCenterX = rect.left + rect.width / 2;
    const logoCenterY = rect.top + rect.height / 2;

    return {
        x: window.innerWidth / 2 - logoCenterX,
        y: window.innerHeight / 2 - logoCenterY,
    };
};

singleWordTargets.forEach((target) => {
    const fragment = document.createDocumentFragment();

    target.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            Array.from(node.textContent).forEach((char) => {
                const span = document.createElement("span");
                span.className = "js-single-char";
                span.textContent = char;
                span.style.display = "inline-block";
                fragment.appendChild(span);
            });
            return;
        }

        fragment.appendChild(node.cloneNode(true));
    });

    target.replaceChildren(fragment);
});



var webStorage = function () {
    if (sessionStorage.getItem('access')) {
        gsap.set(".p-loading", {
            display: "none",
        });
        gsap.set(".p-main", {
            opacity: 1,
        });
        gsap.set(".p-header", {
            opacity: 1,
        });
       
        gsap.set(".js-mv-img", {
            opacity: 1,
            "--mv-mask-progress": "115%",
        });
        gsap.set(".js-mv-logo", {
            opacity: 1,
        });


    } else {
        sessionStorage.setItem('access', 0);

        //最初ふわっと青背景現れる

        opening.fromTo(".p-loading", {
            opacity: 0,
        }, {
            opacity: 1,
            duration: 1.2,
            ease: "power2.inOut",
        });
        opening.to(".p-header", {
            opacity: 1,
            duration: 1.2,
            ease: "power2.inOut",
        });
        opening.to(".p-main", {
            opacity: 1,
            duration: 1.0,
            ease: "power2.inOut",
        });
        //白いロゴだけが現れる
        const openingLogoOffset = getOpeningLogoCenterOffset();

        opening.fromTo(".p-loading__logo", {
            x: openingLogoOffset.x,
            y: openingLogoOffset.y,
        }, {
            x: 0,
            y: 0,
            duration: 1.2,
            ease: "power2.inOut",
        }, "-=1.5");

        opening.fromTo(".js-opening-logo", {
            scale: 3.5,
            transformOrigin: "50% 50%",
        }, {
            scale: 1,
            duration: 1.2,
            ease: "power2.inOut",
        }, "<");

        //文字のところがふわっと現れる
        opening.fromTo(".js-opening-logo-text", {
            opacity: 0,
        }, {
            opacity: 1,
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.inOut",
        });


        //recruitの文字だけ一文字ずつ

        opening.fromTo(".js-opening-logo-recruit", {
            opacity: 0,
            y: 10,
            filter: "blur(10px)",
        }, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "power2.inOut",
        }, "-=0.8");

        //recruitの文字だけオレンジになる
        opening.fromTo(".js-opening-logo-color", {
            fill: "#fff",
        }, {
            fill: "#f77423",
            duration: 1.2,
            ease: "power2.inOut",
        });

        //ロゴ全体がちょっと上に移動
        opening.to(".p-loading__logo", {
            y: -44,
            duration: 1.0,
            ease: "power2.inOut",
        });

        //Grow to Glowの文字が現れる
        opening.fromTo(".p-loading__grow", {
            opacity: 0,
            y: 12,
        }, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.inOut",
        }, "-=0.35");

        opening.to(".p-loading", {
            opacity: 0,
            duration: 1.0,
        });
        opening.to(".p-loading", {
            display: "none",
        });

        opening.fromTo(".js-mv-img", {
            opacity: 0,
            "--mv-mask-progress": "0%",
        }, {
            opacity: 1,
            "--mv-mask-progress": "115%",
            stagger: 0.2,
            ease: "power2.inOut",
            duration: 1.2,
        }, "-=1.0");



        opening.fromTo(".js-single-char", {
            opacity: 0,
            y: 10,
        }, {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            ease: "power2.inOut",
            duration: 1.0,
        });

        opening.fromTo(".js-mv-logo", {
            opacity: 0,
            filter: "blur(10px)",
            y: 10,
        }, {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            ease: "power2.inOut",
            duration: 1.0,
        });

    }
}
webStorage();


let opacityWords = document.querySelectorAll('.js-opacity-word');

opacityWords.forEach((opacityWord) => {
    gsap.fromTo(
        opacityWord,
        {
            opacity: 0,
        },
        {
            opacity: 1,
            duration: 1,
            ease: 'power2.inOut',
            scrollTrigger: {
                trigger: opacityWord,
                start: 'top 90%',
            },
        }
    );
});
let blurWords = document.querySelectorAll('.js-blur-word');

blurWords.forEach((blurWord) => {
    gsap.fromTo(
        blurWord,
        {
            opacity: 0,
            filter: "blur(14px)",
            y: 18,
            scale: 0.96,
        },
        {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: blurWord,
                start: 'top 90%',
            },
        }
    );
});
let jsEachWords = document.querySelectorAll('.js-each-word');

jsEachWords.forEach((jsEachWord) => {
    const fragment = document.createDocumentFragment();

    jsEachWord.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            Array.from(node.textContent).forEach((char) => {
                const span = document.createElement("span");
                span.className = "js-each-char";
                span.textContent = char === " " ? "\u00a0" : char;
                span.style.display = "inline-block";
                fragment.appendChild(span);
            });
            return;
        }

        fragment.appendChild(node.cloneNode(true));
    });

    jsEachWord.replaceChildren(fragment);

    gsap.fromTo(
        jsEachWord.querySelectorAll('.js-each-char'),
        {
            opacity: 0,
            y: 18,
            scale: 0.96,
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.06,
            duration: 1,
            ease: 'power2.inOut',
            scrollTrigger: {
                trigger: jsEachWord,
                start: 'top 90%',
            },
        }
    );
});


let proWords = document.querySelectorAll('.js-pro-word');

proWords.forEach((proWord) => {
    gsap.fromTo(
        proWord,
        {
            "--width": "0%",
            opacity: 0,
        },
        {
            "--width": "100%",
            opacity: 1,
            duration: 1.5,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: {
                trigger: proWord,
                start: 'top 90%',
            },
        }
    );
});



let markers = document.querySelectorAll('.js-marker');

markers.forEach((marker) => {
    gsap.fromTo(
        marker,
        {
            "--width": "0%",
        },
        {
            "--width": "100%",
            delay: 0.5,
            duration: 1,
            ease: 'power2.inOut',
            scrollTrigger: {
                trigger: marker,
                start: 'top 90%',
            },
        }
    );
});

let submits = document.querySelectorAll('.js-submit');

submits.forEach((submit) => {
    gsap.fromTo(
        submit,
        {
            opacity: 0,
            y: 18,
            scale: 0.96,
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            delay: 0.5,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: submit,
                start: 'top 90%',
            },
        }
    );
});

let columns = document.querySelectorAll('.js-column');

columns.forEach((column) => {
    gsap.fromTo(
        column,
        {
            justifyContent: 'flex-start',

        },
        {
            justifyContent: 'space-between',
            duration: 0.8,
            ease: 'power2.inOut',
            scrollTrigger: {
                trigger: column,
                start: 'top 90%',
            },
        }
    );
});
