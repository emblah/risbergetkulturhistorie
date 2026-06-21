const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".site-navigation");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
  });
}

const lightboxLinks = [...document.querySelectorAll("[data-lightbox]")];

if (lightboxLinks.length && typeof HTMLDialogElement !== "undefined") {
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Forstørret bilde");
  dialog.innerHTML = `
    <div class="lightbox-inner">
      <button class="lightbox-close" type="button" aria-label="Lukk bildevisning">Lukk</button>
      <button class="lightbox-previous" type="button" aria-label="Forrige bilde">←</button>
      <figure>
        <img class="lightbox-image" alt="">
      </figure>
      <button class="lightbox-next" type="button" aria-label="Neste bilde">→</button>
    </div>
  `;
  document.body.append(dialog);

  const image = dialog.querySelector(".lightbox-image");
  const closeButton = dialog.querySelector(".lightbox-close");
  const previousButton = dialog.querySelector(".lightbox-previous");
  const nextButton = dialog.querySelector(".lightbox-next");
  let activeLinks = [];
  let activeIndex = 0;
  let returnFocus;

  const showImage = (index) => {
    activeIndex = (index + activeLinks.length) % activeLinks.length;
    const link = activeLinks[activeIndex];
    const thumbnail = link.querySelector("img");
    const figureCaption = link.closest("figure")?.querySelector("figcaption");

    image.src = link.href;
    image.alt = thumbnail?.alt || "";
    const title = figureCaption?.textContent.trim() || image.alt;
    if (title) {
      image.title = title;
    } else {
      image.removeAttribute("title");
    }

    const hasMultipleImages = activeLinks.length > 1;
    previousButton.hidden = !hasMultipleImages;
    nextButton.hidden = !hasMultipleImages;
  };

  const closeLightbox = () => {
    dialog.close();
  };

  lightboxLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      returnFocus = link;
      activeLinks = [...(link.closest(".gallery")?.querySelectorAll("[data-lightbox]") || [link])];
      showImage(activeLinks.indexOf(link));
      dialog.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  previousButton.addEventListener("click", () => showImage(activeIndex - 1));
  nextButton.addEventListener("click", () => showImage(activeIndex + 1));

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeLightbox();
  });

  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    returnFocus?.focus();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && activeLinks.length > 1) {
      event.preventDefault();
      showImage(activeIndex - 1);
    }
    if (event.key === "ArrowRight" && activeLinks.length > 1) {
      event.preventDefault();
      showImage(activeIndex + 1);
    }
  });
}
