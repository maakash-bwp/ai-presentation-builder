import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { createEmptySlide, normalizeSlideForEditor, reindexSlides } from "../utils/slideContent";

const clone = (value) => JSON.parse(JSON.stringify(value));

export const usePresentationEditor = ({
  presentation,
  onSaveRemote
}) => {
  const [localPresentation, setLocalPresentation] = useState(null);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const autosaveTimerRef = useRef(null);
  const hydratedIdRef = useRef(null);

  useEffect(() => {
    if (!presentation || hydratedIdRef.current === presentation._id) {
      return;
    }

    hydratedIdRef.current = presentation._id;
    setLocalPresentation({
      ...presentation,
      slides: presentation.slides.map((slide, index) =>
        normalizeSlideForEditor(slide, index, presentation.title)
      )
    });
    setPast([]);
    setFuture([]);
  }, [presentation]);

  const commitPresentation = (updater) => {
    setLocalPresentation((current) => {
      if (!current) return current;
      const snapshot = clone(current);
      const updated = updater(clone(current));
      setPast((entries) => [...entries, snapshot].slice(-40));
      setFuture([]);
      return updated;
    });
  };

  const isDirty = useMemo(() => past.length > 0, [past.length]);

  const saveNow = async () => {
    if (!localPresentation) return;

    setIsSaving(true);
    try {
      const saved = await onSaveRemote({
        title: localPresentation.title,
        prompt: localPresentation.prompt,
        template: localPresentation.template,
        outline: localPresentation.outline,
        slides: reindexSlides(localPresentation.slides)
      });

      setLocalPresentation({
        ...saved,
        slides: saved.slides.map((slide, index) =>
          normalizeSlideForEditor(slide, index, saved.title)
        )
      });
      setPast([]);
      setFuture([]);
      setLastSavedAt(new Date().toISOString());
      return saved;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Auto-save failed.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!localPresentation || !isDirty) {
      return;
    }

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      saveNow().catch(() => {});
    }, 1500);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [isDirty, localPresentation]);

  const updateSlide = (slideIndex, updater) => {
    commitPresentation((draft) => {
      draft.slides[slideIndex] = updater(draft.slides[slideIndex]);
      return draft;
    });
  };

  const updateSlideField = (slideIndex, field, value) => {
    updateSlide(slideIndex, (slide) => ({
      ...slide,
      [field]: value
    }));
  };

  const updateBullet = (slideIndex, bulletIndex, value) => {
    updateSlide(slideIndex, (slide) => {
      const bulletPoints = [...(slide.bulletPoints || [])];
      bulletPoints[bulletIndex] = value;
      return {
        ...slide,
        bulletPoints
      };
    });
  };

  const addSlideAfter = (slideIndex) => {
    commitPresentation((draft) => {
      draft.slides.splice(slideIndex + 1, 0, createEmptySlide(slideIndex + 1, draft.title));
      draft.slides = reindexSlides(draft.slides).map((slide, index) =>
        normalizeSlideForEditor(slide, index, draft.title)
      );
      return draft;
    });
  };

  const duplicateSlide = (slideIndex) => {
    commitPresentation((draft) => {
      const source = clone(draft.slides[slideIndex]);
      draft.slides.splice(slideIndex + 1, 0, {
        ...source,
        title: `${source.title} Copy`
      });
      draft.slides = reindexSlides(draft.slides);
      return draft;
    });
  };

  const deleteSlide = (slideIndex) => {
    commitPresentation((draft) => {
      if (draft.slides.length === 1) {
        draft.slides = [createEmptySlide(0, draft.title)];
        return draft;
      }

      draft.slides.splice(slideIndex, 1);
      draft.slides = reindexSlides(draft.slides);
      return draft;
    });
  };

  const moveSlide = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    commitPresentation((draft) => {
      const [moved] = draft.slides.splice(fromIndex, 1);
      draft.slides.splice(toIndex, 0, moved);
      draft.slides = reindexSlides(draft.slides);
      return draft;
    });
  };

  const undo = () => {
    if (!past.length || !localPresentation) return;
    const previous = past[past.length - 1];
    setPast((entries) => entries.slice(0, -1));
    setFuture((entries) => [clone(localPresentation), ...entries].slice(0, 40));
    setLocalPresentation(previous);
  };

  const redo = () => {
    if (!future.length || !localPresentation) return;
    const next = future[0];
    setFuture((entries) => entries.slice(1));
    setPast((entries) => [...entries, clone(localPresentation)].slice(-40));
    setLocalPresentation(next);
  };

  return {
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
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    updateSlideField,
    updateBullet,
    updateSlide,
    addSlideAfter,
    duplicateSlide,
    deleteSlide,
    moveSlide
  };
};
