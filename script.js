const $ = (e, p=document) => document.querySelector(e, p);
const $$ = (e, p=document) => document.querySelectorAll(e, p);
const GP = (e, p) => gsap.getProperty(e, p);
const C = (e) => document.createElement(e);



const changeAudio = new Howl({ src: './public/audio/change.mp3'});
const click = new Howl({
  src: './public/audio/click.mp3',
  rate: 0.7
});
const woosh = new Howl({
  src: './public/audio/woosh.mp3',
  volume: 0.5,
  rate: 0.9
})





// Calling F(x)
loadingAnimation();
createAndMoveImage();







// Important F(x)
function lenis() {
  const lenis = new Lenis()
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(time=>lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

function loadingAnimation() {
  const loader = $('.loader');
  const loadingText = $$('.loader .loading-text p');
  const enterBtn = $('.enter-btn');

  const length = changeSvg($('.enter-btn svg rect'), 'hide')
  const enterBtnTl = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut', duration: 0.7 } })
  
  const spans = $$('.enter-btn span');
  enterBtnTl
    .to('.enter-btn >div', {
      clipPath: "inset(0% 0 0 0)",
      ease: 'expo.inOut'
    }, 'a').to(spans[0], {
      yPercent: 100
    }, 'a').to(spans[1], {
      y: 0
    }, 'a')



  gsap.timeline({ defaults: {ease: 'expo.inOut', duration: 2} })
    .from(loadingText[1], {clipPath: 'inset(100% 0 0 0)',
    onComplete: () => {
      enterBtn.addEventListener('mouseenter', () => enterBtnTl.play())
      enterBtn.addEventListener('mouseleave', () => enterBtnTl.reverse())

      enterBtn.addEventListener('click', () => {
        click.play();
        gsap.timeline({ defaults: {ease: 'expo.inOut', duration: 1.5} })
          .to(".enter-btn, .loading-text", {
            y: -25,
            stagger: 0.1,
            opacity: 0
          }).to(loader, {
            height: 0,
            onStart: () => setTimeout(() => {
              woosh.play()
            }, 200)
          }, '-=1').from('.img-con .img', {
            yPercent: 50,
            stagger: 0.1,
            opacity: 0
          }, '-=1').from('.img-con', {
            gap: 0
          }, '-=1').from('.viewer>*', {
            opacity: 0
          }, '<').to('body', {
            overflow: 'initial',
          })
      })
    }})
    .from(".enter-btn p span", {
      yPercent: 100,
      duration: 1,
      opacity: 0
    }, '-=1')
    .to(".enter-btn svg rect", {
      strokeDashoffset: 0
    }, '-=1')
}

function createAndMoveImage() {
  const url = idx => `https://camillemormal.com/static/media/d/load/${idx}.jpg`;
  const imgCon = $('.img-con');
  const hiddenCon = $('.hidden-con');
  // 0 - 24

  for (let i = 0; i <= 8; i++) {
    imgCon.innerHTML += `
        <div class="img flex-shrink-0 h-96 w-72">
          <img class="h-full w-full object-cover -z-[2]" src="${url(i)}" alt="image" style="object-position: 100% 50%;" draggable="false">
        </div>
        `;
    hiddenCon.innerHTML += `
        <div class="flex-shrink-0">
          <img class="h-[30px] w-[50px] object-cover" src="${url(i)}" alt="image" style="object-position: 100% 50%;" draggable="false">
        </div>
    `;
  }

  
  const showIndex = $('.show-index');
  const imgs = $$('.img img');
  $('.viewer .total').textContent = imgs.length;
  let prevId = 0;
  const scrollTw = gsap.to(imgCon, {
    xPercent: -100,
    ease: 'none',
    marginLeft: (window.innerWidth/2 + 288/2),
    scrollTrigger: {
      id: "scrollHorizontal",
      pin: 'main',
      end: () => '+=' + 
        (imgCon.offsetWidth),
      scrub: 1.5,
      onUpdate: ({progress}) => updateIndex(progress)
    }
  })
  
  
  imgs.forEach((img, i) => {
    const span = C('span');
    span.textContent = i+1;
    showIndex.appendChild(span);
    
    gsap.to(img, {
      objectPosition: '0% 50%',
      ease: 'none',
      scrollTrigger: {
        // markers: true,
        containerAnimation: scrollTw,
        trigger: img,
        scrub: true
      }
    })
  })

  function updateIndex(progress) {
    const max = 100 * (1 - 1/imgs.length);
    const crrImgIdx = Math.round(gsap.utils.mapRange(0, 1, 1, imgs.length, progress));
    
    if((prevId) !== crrImgIdx) {
      prevId = crrImgIdx;
      const movement = (prevId === 0) ? 0 : -((prevId-1) * 100 / imgs.length);
      gsap.to('.show-index', {
        yPercent: movement,
        ease: 'back',
        onStart: () => changeAudio.play()
      })
    }
  }
}

function changeSvg(element, arg) {
  if (arg === 'hide') {
    return returnLength(element, 'hide');
  } else if (arg === 'hide-multiple' && Array.isArray(element)) {
    return element.map(e => returnLength(e, 'hide'));
  } else {
    return returnLength(element);
  }
}

function returnLength(element, arg) {
  let length = 0;
  if (element.tagName === 'line') {
    const line = element;
    const x1 = parseFloat(line.getAttribute('x1'));
    const y1 = parseFloat(line.getAttribute('y1'));
    const x2 = parseFloat(line.getAttribute('x2'));
    const y2 = parseFloat(line.getAttribute('y2'));
    length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  } else if (element.tagName === 'path') {
    const path = element;
    length = path.getTotalLength();
  } else if (element.tagName === 'rect') {
    const rect = element;
    const svg = rect.closest('svg');
    const viewBoxWidth = parseFloat(svg.getAttribute('viewBox').split(' ')[2]);
    const viewBoxHeight = parseFloat(svg.getAttribute('viewBox').split(' ')[3]);
    const width = parseFloat(rect.getAttribute('width')) || viewBoxWidth;
    const height = parseFloat(rect.getAttribute('height')) || viewBoxHeight;
    length = 2 * (width + height);
  }

  if (arg === 'hide') {
    element.style.strokeDasharray = length + ' ' + length;
    element.style.strokeDashoffset = length;
  }

  return length;
}