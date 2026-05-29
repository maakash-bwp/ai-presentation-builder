import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import PptxGenJS from "pptxgenjs";

const slugify = (value) =>
  String(value || "presentation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const waitForImages = async (element) => {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
};

const captureSlideNodes = async (count) => {
  const nodes = [];

  for (let index = 0; index < count; index += 1) {
    const element = document.querySelector(`[data-slide-export="slide-${index}"]`);
    if (!element) {
      throw new Error("Slide canvas not found for export.");
    }

    await waitForImages(element);
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: false
    });
    nodes.push(canvas.toDataURL("image/png"));
  }

  return nodes;
};

export const exportPresentationAsJson = (presentation) => {
  const blob = new Blob([JSON.stringify(presentation, null, 2)], {
    type: "application/json"
  });
  saveAs(blob, `${slugify(presentation.title)}.json`);
};

export const exportPresentationAsPdf = async (presentation) => {
  const images = await captureSlideNodes(presentation.slides.length);
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1280, 720]
  });

  images.forEach((image, index) => {
    if (index > 0) {
      pdf.addPage([1280, 720], "landscape");
    }
    pdf.addImage(image, "PNG", 0, 0, 1280, 720);
  });

  pdf.save(`${slugify(presentation.title)}.pdf`);
};

export const exportPresentationAsPptx = async (presentation) => {
  const images = await captureSlideNodes(presentation.slides.length);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "SlideCraft AI";
  pptx.company = "SlideCraft AI";
  pptx.subject = presentation.title;
  pptx.title = presentation.title;

  images.forEach((image) => {
    const slide = pptx.addSlide();
    slide.addImage({
      data: image,
      x: 0,
      y: 0,
      w: 13.333,
      h: 7.5
    });
  });

  await pptx.writeFile({ fileName: `${slugify(presentation.title)}.pptx` });
};

export const exportPresentationAsPng = async (presentation) => {
  const images = await captureSlideNodes(presentation.slides.length);
  const zip = new JSZip();

  images.forEach((image, index) => {
    const base64 = image.split(",")[1];
    zip.file(`${slugify(presentation.title)}-slide-${index + 1}.png`, base64, { base64: true });
  });

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${slugify(presentation.title)}-slides.zip`);
};
