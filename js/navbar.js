var prevScrollpos = window.pageYOffset;

function handleScroll() {
  // Check if screen width is below 1020px
  if (window.innerWidth < 1020) {
    var currentScrollPos = window.pageYOffset;
    var navbar = document.getElementById("navbar");

    if (prevScrollpos > currentScrollPos) {
      navbar.style.top = "0";
    } else {
      navbar.style.top = "-76px";
    }
    prevScrollpos = currentScrollPos;
  }
}

// Add event listeners
window.onscroll = handleScroll;

// Also handle screen resize in case user changes window size
window.onresize = function () {
  var navbar = document.getElementById("navbar");
  // If screen is larger than 1020px, ensure navbar is visible
  if (window.innerWidth >= 1019) {
    navbar.style.top = "0";
  }
};
