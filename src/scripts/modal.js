document.addEventListener("DOMContentLoaded", function () {
  const dialogElement = document.getElementById("modal");

  const openBtn = document.getElementById("open-button");

  const closeBtn = document.getElementById("close-button");

  openBtn.addEventListener("click", () => {
    dialogElement.showModal();
  });

  closeBtn.addEventListener("click", () => {
    dialogElement.close();
  });

  dialogElement.addEventListener("click", function (event) {
    const dialogBounds = dialogElement.getBoundingClientRect();
    if (
      event.clientX < dialogBounds.left ||
      event.clientX > dialogBounds.right ||
      event.clientY < dialogBounds.top ||
      event.clientY > dialogBounds.bottom
    ) {
      dialogElement.close();
    }
  });
});
