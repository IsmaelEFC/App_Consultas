
document.querySelectorAll(".box").forEach((box) => {
  box.addEventListener("click", () => {
    window.location.href = box.dataset.url;
  });
});


