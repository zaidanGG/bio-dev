// Bintang jatuh
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2,
    speed: Math.random() * 1 + 0.5
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    s.y += s.speed;
    if (s.y > canvas.height) s.y = 0;
  });
  requestAnimationFrame(animate);
}
animate();

// // Audio autoplay (aktifkan suara setelah user interaction di browser tertentu)
// window.addEventListener("click", () => {
//   const audio = document.getElementById("bg-audio");
//   audio.muted = false;
//   audio.play();
// });

// Script utama: VanillaTilt, overlay enter, typewriter, injected styles

document.addEventListener('DOMContentLoaded', () => {
  // VanillaTilt init (cek ketersediaan library)
  if (window.VanillaTilt) {
    const tiltEl = document.querySelector(".tilt-card");
    if (tiltEl) {
      VanillaTilt.init(tiltEl, {
        max: 10,
        speed: 800,
        perspective: 2000,
        scale: 1.03,
        glare: false,
      });
    }
  }

  // Overlay "click to enter" + video control
  const video = document.getElementById('bgVideo');
  const overlay = document.getElementById('enterOverlay');

  function enterSite() {
    if (!overlay) return;
    overlay.classList.add('opacity-0');
    setTimeout(() => { overlay.style.display = 'none'; }, 500);
    if (video) {
      // pastikan gesture: unmute lalu play
      video.muted = false;
      video.play().catch(()=>{ /* silent fail */ });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', enterSite);
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Enter') enterSite(); });
    // supaya bisa fokus dengan keyboard
    overlay.setAttribute('tabindex', '0');
  }

  // Helper kecil
  const sleep = ms => new Promise(res => setTimeout(res, ms));

  // type single element
  async function typeText(el, text, speed = 80) {
    for (let i = 1; i <= text.length; i++) {
      el.textContent = text.slice(0, i);
      await sleep(speed);
    }
  }

  // delete single element
  async function deleteText(el, speed = 40) {
    while (el.textContent.length > 0) {
      el.textContent = el.textContent.slice(0, -1);
      await sleep(Math.max(30, speed));
    }
    // ensure empty string (some browsers treat empty title differently)
    el.textContent = '';
  }

  // Sequenced loop: role -> delete -> subtitle -> delete -> repeat
  (async function loopTypeSequence() {
    const roleEl = document.getElementById('role');
    const subEl  = document.getElementById('subtitle') || document.querySelector('#role + p');

    if (!roleEl || !subEl) return; // nothing to do

    // read texts (prioritize data-text attribute, fallback to current content)
    const roleText = roleEl.dataset.text ? roleEl.dataset.text.trim() : roleEl.textContent.trim();
    const subText  = subEl.dataset.text ? subEl.dataset.text.trim() : subEl.textContent.trim();

    const roleSpeed = 90;
    const subSpeed  = 70;
    const pauseAfterType = 900;
    const pauseBetween = 200;

    // infinite loop
    while (true) {
      // role
      await typeText(roleEl, roleText, roleSpeed);
      await sleep(pauseAfterType);
      await deleteText(roleEl, Math.round(roleSpeed / 2));
      await sleep(pauseBetween);

      // subtitle (line 91)
      await typeText(subEl, subText, subSpeed);
      await sleep(pauseAfterType);
      await deleteText(subEl, Math.round(subSpeed / 2));
      await sleep(pauseBetween);
    }
  })();

  // Typewriter effect
  function typeWriter(el, text, speed = 80) {
    if (!el) return;
    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor ml-1';
    cursor.textContent = '|';
    el.appendChild(cursor);

    let i = 0;
    function step() {
      if (i < text.length) {
        cursor.insertAdjacentText('beforebegin', text.charAt(i));
        i++;
        setTimeout(step, speed);
      }
    }
    step();
  }

  const p = document.getElementById('role');
  if (p && p.dataset.text) typeWriter(p, p.dataset.text, 90);

  // Inject simple cursor blink style
  const s = document.createElement('style');
  s.textContent = `.typewriter-cursor{animation: blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`;
  document.head.appendChild(s);

  // Typewriter for document.title with static '@' prefix.
  (function titleTypewriter(full = '@Zeefall', typingSpeed = 20, pauseDelay = 900) {
    const prefix = full.startsWith('@') ? '@' : '';
    const name = full.slice(prefix.length); // "Zeefall"
    let isDeleting = false;
    let text = '';

    function tick() {
      if (!isDeleting) {
        // ketik maju mulai dari 'Z' (nama tanpa prefix)
        text = name.slice(0, text.length + 1);
        document.title = prefix + text;

        if (text === name) {
          // selesai mengetik, tunggu lalu mulai menghapus (tetap mempertahankan '@')
          setTimeout(() => { isDeleting = true; tick(); }, pauseDelay);
          return;
        }
      } else {
        // hapus karakter dari nama saja, jangan hapus prefix '@'
        text = name.slice(0, text.length - 1);
        document.title = (text ? prefix + text : prefix);

        if (text === '') {
          // selesai hapus (tetap hanya '@'), lanjut ke loop berikutnya
          isDeleting = false;
          setTimeout(tick, typingSpeed);
          return;
        }
      }

      const delay = isDeleting ? Math.round(typingSpeed / 2) : typingSpeed;
      setTimeout(tick, delay);
    }

    setTimeout(tick, 300);
  })('@Zeefall', 120, 900);
});