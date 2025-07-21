document.addEventListener("DOMContentLoaded", () => {
  const cardGroups = document.querySelectorAll(".card-group");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  let currentPage = 1;
  const totalPages = cardGroups.length;

  function switchPage(newPage) {
    // Exit if same page or invalid page
    if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;

    const currentGroup = document.querySelector(
      `.card-group[data-page="${currentPage}"]`
    );
    const newGroup = document.querySelector(
      `.card-group[data-page="${newPage}"]`
    );

    // Hide current group
    currentGroup.classList.remove("active");

    // Show new group
    newGroup.classList.add("active");

    // Update current page and dots
    currentPage = newPage;
    dots.forEach((dot) => {
      dot.classList.toggle(
        "active",
        parseInt(dot.dataset.page) === currentPage
      );
    });

    // Update button states
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  // Event listeners
  prevBtn.addEventListener("click", () => switchPage(currentPage - 1));
  nextBtn.addEventListener("click", () => switchPage(currentPage + 1));

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetPage = parseInt(dot.dataset.page);
      switchPage(targetPage);
    });
  });
});
