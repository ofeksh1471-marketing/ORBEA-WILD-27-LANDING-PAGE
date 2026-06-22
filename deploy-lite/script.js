const accordionGroups = document.querySelectorAll("[data-accordion-group]");

accordionGroups.forEach((group) => {
  const cards = [...group.querySelectorAll(".expand-card")];

  cards.forEach((card) => {
    const button = card.querySelector(".expand-toggle");

    button.addEventListener("click", () => {
      const shouldOpen = !card.classList.contains("open");

      cards.forEach((item) => {
        item.classList.remove("open");
        item.querySelector(".expand-toggle").setAttribute("aria-expanded", "false");
      });

      if (shouldOpen) {
        card.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });
});

const revealItems = document.querySelectorAll(".reveal-on-scroll");

const lazyImages = document.querySelectorAll("img[data-src]");

const loadLazyImage = (image) => {
  if (image.dataset.srcset) {
    image.srcset = image.dataset.srcset;
    image.removeAttribute("data-srcset");
  }

  image.src = image.dataset.src;
  image.removeAttribute("data-src");
};

if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadLazyImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "600px 0px", threshold: 0.01 }
  );

  lazyImages.forEach((image) => imageObserver.observe(image));
} else {
  lazyImages.forEach(loadLazyImage);
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll("img[data-fallback-label]").forEach((image) => {
  const showImage = () => {
    image.closest(".media-card")?.classList.add("has-media");
    image.style.opacity = "1";
  };

  const showFallback = () => {
    image.closest(".media-card")?.classList.remove("has-media");
    image.style.opacity = "0";
  };

  image.addEventListener("load", showImage);
  image.addEventListener("error", showFallback);

  if (image.complete) {
    if (image.naturalWidth > 0) {
      showImage();
    } else {
      showFallback();
    }
  }
});

document.querySelectorAll("[data-video-frame]").forEach((frame) => {
  const video = frame.querySelector("video");

  video.addEventListener("loadeddata", () => {
    frame.classList.add("has-media");
  });

  video.addEventListener("error", () => {
    frame.classList.remove("has-media");
  });
});

const models = [
  { name: "ORBEA WILD LT M20", image: "assets/media/Models/WILD LT M20" },
  { name: "ORBEA WILD LT M10", image: "assets/media/Models/WILD LT M10" },
  { name: "ORBEA WILD LT M-TEAM RS", image: "assets/media/Models/WILD LT M-TEAM RS" },
  { name: "ORBEA WILD LT M-LTD RS", image: "assets/media/Models/WILD M LT M-LTD RS" },
];

const modelName = document.querySelector("#model-name");
const modelImage = document.querySelector("#model-image");
const modelTabs = document.querySelector(".model-tabs");
const modelPlaceholder = document.querySelector(".model-placeholder span");
const missingModelImages = new Set();
let activeModel = 0;
let modelTimer;
let modelsInView = false;

modelImage.addEventListener("error", () => {
  if (modelImage.dataset.currentModelImage) {
    missingModelImages.add(modelImage.dataset.currentModelImage);
  }
});

function showModel(index) {
  activeModel = (index + models.length) % models.length;
  const model = models[activeModel];

  modelName.textContent = model.name;
  modelImage.style.opacity = "0";
  modelImage.style.transform = "translateY(8px) scale(0.985)";

  window.setTimeout(() => {
    modelImage.alt = model.name;
    modelImage.dataset.currentModelImage = model.image;
    modelImage.dataset.fallbackLabel = `${model.name}.webp`;
    modelPlaceholder.textContent = `${model.name}.webp`;

    if (missingModelImages.has(model.image)) {
      modelImage.removeAttribute("src");
      modelImage.removeAttribute("srcset");
      modelImage.closest(".media-card")?.classList.remove("has-media");
      return;
    }

    modelImage.src = `${model.image}-1800.webp`;
    modelImage.srcset = `${model.image}-900.webp 900w, ${model.image}-1800.webp 1800w`;
    modelImage.style.opacity = "1";
    modelImage.style.transform = "translateY(0) scale(1)";
  }, 160);

  [...modelTabs.children].forEach((tab, tabIndex) => {
    tab.classList.toggle("active", tabIndex === activeModel);
  });
}

function startModelRotation() {
  clearInterval(modelTimer);
  if (!modelsInView) return;
  modelTimer = setInterval(() => showModel(activeModel + 1), 3200);
}

models.forEach((model, index) => {
  const tab = document.createElement("button");
  tab.className = "model-tab";
  tab.type = "button";
  tab.textContent = model.name;
  tab.addEventListener("click", () => {
    showModel(index);
    startModelRotation();
  });
  modelTabs.append(tab);
});

modelTabs.firstElementChild?.classList.add("active");

const modelsSection = document.querySelector("#models");

if ("IntersectionObserver" in window) {
  const modelObserver = new IntersectionObserver(
    ([entry]) => {
      modelsInView = entry.isIntersecting;

      if (modelsInView) {
        showModel(activeModel);
        startModelRotation();
      } else {
        clearInterval(modelTimer);
      }
    },
    { rootMargin: "240px 0px", threshold: 0.01 }
  );

  modelObserver.observe(modelsSection);
} else {
  modelsInView = true;
  showModel(0);
  startModelRotation();
}

document.querySelector(".lead-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector(".submit-button");
  const formData = new FormData(form);

  button.disabled = true;
  button.textContent = "שולח...";

  try {
    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    });

    form.reset();
    form.classList.add("submitted");
    button.textContent = "נשלח";
  } catch (error) {
    button.disabled = false;
    button.textContent = "נסה שוב";
  }
});
