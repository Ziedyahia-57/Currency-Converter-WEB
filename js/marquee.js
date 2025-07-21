document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.querySelector(".logo-carousel");
  const track = document.querySelector(".logo-track");
  const logos = document.querySelectorAll(".brand-logo");

  if (!carousel || !track || logos.length === 0) return;

  // Clone logos for seamless looping
  const cloneLogos = () => {
    if (track.dataset.cloned) return;
    logos.forEach((logo) => {
      track.appendChild(logo.cloneNode(true));
    });
    track.dataset.cloned = true;
  };

  // Adjust animation duration based on content
  const setAnimation = () => {
    const trackWidth = track.scrollWidth / 2; // Original content width
    const containerWidth = carousel.offsetWidth;
    const speedRatio = trackWidth / containerWidth;

    // Base duration (adjust for desired speed)
    const duration = 20 * Math.max(1, speedRatio);

    // track.style.animation = `scroll ${duration}s linear infinite`;
    track.style.animation = `scroll 20s linear infinite`;
  };

  // Initialize marquee
  cloneLogos();
  setAnimation();

  // Handle window resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setAnimation, 250);
  });
});
