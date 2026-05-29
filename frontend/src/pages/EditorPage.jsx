import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Download,
  MonitorPlay,
  Redo2,
  Save,
  Undo2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { usePresentationStore } from "../store/presentationStore";
import LoadingSpinner from "../components/LoadingSpinner";
import InlineSlideCanvasEditor from "../components/InlineSlideCanvasEditor";
import {
  exportPresentationAsJson,
  exportPresentationAsPdf,
  exportPresentationAsPng,
  exportPresentationAsPptx
} from "../utils/exportPresentation";
import { generateImageRequest } from "../services/aiService";
import { createSlideImagePrompt } from "../utils/slideContent";
import { getNextSlideLayoutVariant } from "../utils/slideLayouts";
import { usePresentationEditor } from "../hooks/usePresentationEditor";
import { preloadImage } from "../utils/imagePipeline";

export default function EditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [imageLoadingMap, setImageLoadingMap] = useState({});
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const activeAutoImageTasksRef = useRef(new Set());

  const fetchPresentationById = usePresentationStore((state) => state.fetchPresentationById);
  const updatePresentation = usePresentationStore((state) => state.updatePresentation);
  const isLoading = usePresentationStore((state) => state.isLoading);

  const {
    localPresentation,
    setLocalPresentation,
    isSaving,
    isDirty,
    lastSavedAt,
    zoom,
    setZoom,
    saveNow,
    undo,
    redo,
    canUndo,
    canRedo,
    updateSlideField,
    updateBullet,
    addSlideAfter,
    duplicateSlide,
    deleteSlide,
    moveSlide
  } = usePresentationEditor({
    presentation: usePresentationStore((state) => state.selectedPresentation),
    onSaveRemote: (payload) => updatePresentation(id, payload)
  });

  useEffect(() => {
    const load = async () => {
      try {
        const presentation = await fetchPresentationById(id);
        setLocalPresentation({
          ...presentation,
          slides: presentation.slides
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load presentation.");
        navigate("/dashboard");
      }
    };

    load();
  }, [fetchPresentationById, id, navigate, setLocalPresentation]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveNow()
          .then(() => {
            toast.success("Presentation saved.");
          })
          .catch(() => {});
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }

      if (
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") ||
        ((event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          event.key.toLowerCase() === "z")
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, saveNow, undo]);

  const onSave = async () => {
    try {
      await saveNow();
      toast.success("Presentation saved.");
    } catch {
      // saveNow already toasts on failure
    }
  };

  const setImageLoading = (slideIndex, isLoading) => {
    setImageLoadingMap((current) => ({
      ...current,
      [slideIndex]: isLoading
    }));
  };

  const onRegenerateImage = async (slideIndex, promptOverride = "") => {
    const slide = localPresentation?.slides?.[slideIndex];
    if (!slide || !localPresentation) return;

    setImageLoading(slideIndex, true);
    try {
      const prompt =
        String(promptOverride || "").trim() ||
        slide.imagePrompt?.trim() ||
        createSlideImagePrompt(localPresentation.title, slide);
      const image = await generateImageRequest(prompt);
      const preloaded = await preloadImage(image.imageUrl, {
        timeoutMs: 25000,
        retries: 2,
        retryDelayMs: 700
      });
      updateSlideField(slideIndex, "imagePrompt", prompt);
      updateSlideField(
        slideIndex,
        "imageUrl",
        preloaded.ok ? preloaded.url : image.imageUrl
      );
      toast.success(`Image regenerated for slide ${slideIndex + 1}.`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Image generation failed.");
    } finally {
      setImageLoading(slideIndex, false);
    }
  };

  const onDeleteImage = (slideIndex) => {
    updateSlideField(slideIndex, "imageUrl", "");
  };

  useEffect(() => {
    if (!localPresentation?.slides?.length) return;

    const missingImageIndexes = localPresentation.slides
      .map((slide, index) => ({ slide, index }))
      .filter(
        ({ slide, index }) =>
          !String(slide?.imageUrl || "").trim() &&
          !activeAutoImageTasksRef.current.has(index)
      );

    if (!missingImageIndexes.length) return;

    console.debug("EDITOR AUTO IMAGE QUEUE START:", missingImageIndexes.map(({ index }) => index));

    const tasks = missingImageIndexes.map(({ slide, index }) => {
      activeAutoImageTasksRef.current.add(index);
      setImageLoading(index, true);
      const prompt = slide.imagePrompt?.trim() || createSlideImagePrompt(localPresentation.title, slide);
      updateSlideField(index, "imagePrompt", prompt);

      return generateImageRequest(prompt)
        .then((image) =>
          preloadImage(image.imageUrl, {
            timeoutMs: 25000,
            retries: 2,
            retryDelayMs: 700
          }).then((preloaded) => ({ image, preloaded }))
        )
        .then(({ image, preloaded }) => {
          const resolvedImageUrl = (preloaded.ok ? preloaded.url : image.imageUrl || "").trim();
          updateSlideField(index, "imageUrl", resolvedImageUrl);
          console.debug("EDITOR AUTO IMAGE QUEUE SUCCESS:", { index });
        })
        .catch((error) => {
          console.debug("EDITOR AUTO IMAGE QUEUE FAILURE:", {
            index,
            message: error?.message || "Unknown generation error"
          });
        })
        .finally(() => {
          activeAutoImageTasksRef.current.delete(index);
          setImageLoading(index, false);
        });
    });

    Promise.allSettled(tasks).then(() => {
      console.debug("EDITOR AUTO IMAGE QUEUE SETTLED");
    });
  }, [localPresentation, updateSlideField]);

  const runExport = async (exporter, successMessage) => {
    if (!localPresentation) return;
    setIsExporting(true);
    try {
      await exporter(localPresentation);
      toast.success(successMessage);
    } catch (error) {
      toast.error(error?.message || "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || !localPresentation) {
    return (
      <div className="saas-card p-6">
        <LoadingSpinner label="Loading editor..." />
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="saas-card flex flex-col gap-4 p-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slatePro-900">{localPresentation.title}</h1>
            <p className="text-sm text-slatePro-600">
              Inline canvas editor with auto-save, drag reorder, undo/redo, and per-slide image controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={undo} disabled={!canUndo} className="btn-secondary px-3 py-2 text-sm">
              <Undo2 className="h-4 w-4" />
              Undo
            </button>
            <button onClick={redo} disabled={!canRedo} className="btn-secondary px-3 py-2 text-sm">
              <Redo2 className="h-4 w-4" />
              Redo
            </button>
            <button onClick={() => setZoom((current) => Math.max(70, current - 10))} className="btn-secondary px-3 py-2 text-sm">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="rounded-xl border border-slatePro-200 bg-slatePro-50 px-3 py-2 text-sm font-semibold text-slatePro-600">
              {zoom}%
            </span>
            <button onClick={() => setZoom((current) => Math.min(130, current + 10))} className="btn-secondary px-3 py-2 text-sm">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button onClick={onSave} className="btn-primary" disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => exportPresentationAsJson(localPresentation)} className="btn-secondary">
              <Download className="h-4 w-4" />
              JSON
            </button>
            <button onClick={() => runExport(exportPresentationAsPdf, "PDF exported.")} className="btn-secondary" disabled={isExporting}>
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button onClick={() => runExport(exportPresentationAsPptx, "PPTX exported.")} className="btn-secondary" disabled={isExporting}>
              <Download className="h-4 w-4" />
              PPTX
            </button>
            <button onClick={() => runExport(exportPresentationAsPng, "PNG slides exported.")} className="btn-secondary" disabled={isExporting}>
              <Download className="h-4 w-4" />
              PNG
            </button>
            <Link to={`/present/${localPresentation._id}`} className="btn-secondary">
              <MonitorPlay className="h-4 w-4" />
              Present
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slatePro-500">
          <span>{isDirty ? "Unsaved changes" : "All changes saved"}</span>
          {lastSavedAt ? <span>Last saved {new Date(lastSavedAt).toLocaleTimeString()}</span> : null}
          <span>Shortcuts: Ctrl/Cmd+S, Ctrl/Cmd+Z, Ctrl/Cmd+Y</span>
        </div>
      </motion.div>

      <div className="space-y-8">
        {localPresentation.slides.map((slide, slideIndex) => (
          <InlineSlideCanvasEditor
            key={`${slide.order}-${slide.title}`}
            slide={slide}
            index={slideIndex}
            template={localPresentation.template}
            zoom={zoom}
            isImageLoading={Boolean(imageLoadingMap[slideIndex])}
            onFieldChange={(field, value) => updateSlideField(slideIndex, field, value)}
            onBulletChange={(bulletIndex, value) => updateBullet(slideIndex, bulletIndex, value)}
            onRegenerateImage={(promptOverride) => onRegenerateImage(slideIndex, promptOverride)}
            onDeleteImage={() => onDeleteImage(slideIndex)}
            onDuplicate={() => duplicateSlide(slideIndex)}
            onDeleteSlide={() => deleteSlide(slideIndex)}
            onAddAfter={() => addSlideAfter(slideIndex)}
            onCycleLayout={() =>
              updateSlideField(
                slideIndex,
                "layoutVariant",
                getNextSlideLayoutVariant(slide.layoutVariant)
              )
            }
            onImageStyleChange={(nextStyle) => updateSlideField(slideIndex, "imageStyle", nextStyle)}
            onDragStart={() => setDraggingIndex(slideIndex)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggingIndex === null) return;
              moveSlide(draggingIndex, slideIndex);
              setDraggingIndex(null);
            }}
          />
        ))}
      </div>
    </section>
  );
}
