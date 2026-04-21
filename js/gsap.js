// gsap.registerPlugin(ScrollTrigger);

// const opening = gsap.timeline();

// opening.fromTo(".js-mv-img", {
//   opacity: 0,
//   filter: "blur(10px)",
// }, {
//   filter: "blur(0px)",
//   opacity: 1,
//   stagger: 0.2,
//   ease: "power2.inOut",
//   duration: 1.0,
// });
// opening.fromTo(".js-header", {
//   opacity: 0,
//   y: -100,
// }, {
//   opacity: 1,
//   y: 0,
//   ease: 'power2.inOut',
//   duration: 1.0,
// },"-=0.8");

// let opacityWords = document.querySelectorAll('.js-opacity-word');

// opacityWords.forEach((opacityWord) => {
//   gsap.fromTo(
//     opacityWord,
//     {
//       opacity: 0,
//     },
//     {
//       opacity: 1,
//       duration: 1,
//       ease: 'power2.inOut',
//       scrollTrigger: {
//         trigger: opacityWord,
//         start: 'top 90%',
//       },
//     }
//   );
// });
// let proWords = document.querySelectorAll('.js-pro-word');

// proWords.forEach((proWord) => {
//   gsap.fromTo(
//     proWord,
//     {
//       "--width": "0%",
//       opacity: 0,
//     },
//     {
//       "--width": "100%",
//       opacity: 1,
//       duration: 1.5,
//       ease: 'power3.out',
//       stagger: 0.08,
//       scrollTrigger: {
//         trigger: proWord,
//         start: 'top 90%',
//       },
//     }
//   );
// });

// let yellowWords = document.querySelectorAll('.js-yellow-word');

// yellowWords.forEach((yellowWord) => {
//   gsap.fromTo(
//     yellowWord,
//     {
//       color: "#fff",
//     },
//     {
//       color: "#fff100",
//       delay: 0.5,
//       duration: 1,
//       ease: 'power2.inOut',
//       scrollTrigger: {
//         trigger: yellowWord,
//         start: 'top 90%',
//       },
//     }
//   );
// });
// let blueWords = document.querySelectorAll('.js-blue-word');

// blueWords.forEach((blueWord) => {
//   gsap.fromTo(
//     blueWord,
//     {
//       color: "#111",
//     },
//     {
//       color: "#54C3F1",
//       delay: 0.5,
//       duration: 1,
//       ease: 'power2.inOut',
//       scrollTrigger: {
//         trigger: blueWord,
//         start: 'top 90%',
//       },
//     }
//   );
// });
// let markers = document.querySelectorAll('.js-marker');

// markers.forEach((marker) => {
//   gsap.fromTo(
//     marker,
//     {
//       "--width": "0%",
//     },
//     {
//       "--width": "100%",
//       delay: 0.5,
//       duration: 1,
//       ease: 'power2.inOut',
//       scrollTrigger: {
//         trigger: marker,
//         start: 'top 90%',
//       },
//     }
//   );
// });

// let submits = document.querySelectorAll('.js-submit');

// submits.forEach((submit) => {
//   gsap.fromTo(
//     submit,
//     {
//       clipPath: "inset(100% 100% 100% 100%)",
//     },
//     {
//       clipPath: "inset(0% 0% 0% 0%)",
//       delay: 0.5,
//       duration: 1,
//       ease: 'power2.inOut',
//       scrollTrigger: {
//         trigger: submit,
//         start: 'top 90%',
//       },
//     }
//   );
// });

