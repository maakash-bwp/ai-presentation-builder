import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Paperclip,
  PlusCircle,
  Save,
  Sparkles,
  Square,
  Wand2
} from "lucide-react";
import { toast } from "react-toastify";
import TemplateSelector from "../components/TemplateSelector";
import LoadingSpinner from "../components/LoadingSpinner";
import InlineSlideCanvasEditor from "../components/InlineSlideCanvasEditor";
import { TEMPLATE_OPTIONS } from "../utils/templates";
import { usePresentationStore } from "../store/presentationStore";
import { useSettingsStore } from "../store/settingsStore";
import {
  generateImageRequest,
  streamOutlineRequest,
  streamSlidesRequest
} from "../services/aiService";
import {
  createEmptySlide,
  createSlideImagePrompt,
  normalizeSlideForEditor,
  reindexSlides
} from "../utils/slideContent";
import { getNextSlideLayoutVariant, getSlideLayoutVariant } from "../utils/slideLayouts";
import { preloadImage } from "../utils/imagePipeline";

const promptSuggestions = [
  "Startup pitch deck for an AI workflow product",
  "AI in healthcare: opportunities, risks, and impact",
  "Marketing strategy deck for a SaaS launch",
  "SaaS business plan for enterprise automation",
  "Portfolio presentation for a product designer"
];

const presentationTypes = ["Pitch Deck", "Business Report", "Education", "Portfolio", "Strategy"];
const activityIcons = {
  info: Clock3,
  success: CheckCircle2,
  working: Loader2
};

const phaseReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: "easeOut" }
};

const typingSuggestion = ({ text }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
    <span>{text}</span>
    <span className="h-3 w-0.5 animate-pulse bg-cyan-300" />
  </span>
);

const OutlineEditableField = ({ value, onChange, placeholder }) => {
  const fieldRef = useRef(null);

  useEffect(() => {
    if (!fieldRef.current) {
      return;
    }

    fieldRef.current.style.height = "0px";
    fieldRef.current.style.height = `${fieldRef.current.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={fieldRef}
      rows={1}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      dir="ltr"
      spellCheck
      className="w-full resize-none overflow-hidden bg-transparent text-left text-sm font-semibold leading-6 text-slate-100 outline-none placeholder:text-slate-500"
    />
  );
};

const PromptComposer = ({
  draft,
  onDraftChange,
  typingText,
  isGenerating,
  onGenerateOutline,
  onGenerateAll
}) => (
  <section className="relative overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-slatePro-950/90 p-6 shadow-[0_32px_90px_rgba(2,132,199,0.25)] backdrop-blur-xl md:p-8">
    <div className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl" />
    <div className="pointer-events-none absolute -right-16 bottom-6 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
    <div className="relative z-10 mx-auto max-w-5xl space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" />
          AI Studio
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
          What would you like to create today?
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
          Generate polished AI presentations with live streaming slides, editable layouts, and cinematic visuals.
        </p>
      </div>

      <div className="group relative rounded-[1.75rem] border border-cyan-200/25 bg-slatePro-900/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.6)] transition duration-300 focus-within:border-cyan-300/60 focus-within:shadow-[0_20px_70px_rgba(56,189,248,0.2)]">
        <textarea
          rows={5}
          value={draft.topic}
          onChange={(event) => onDraftChange({ topic: event.target.value, prompt: event.target.value })}
          placeholder="Describe your presentation..."
          className="w-full resize-none bg-transparent px-2 py-2 text-base leading-7 text-white placeholder:text-slate-400 outline-none md:text-lg"
        />

        <div className="mt-3 flex flex-col gap-3 border-t border-slate-700/80 pt-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={draft.numberOfSlides}
              onChange={(event) => onDraftChange({ numberOfSlides: event.target.value })}
              className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-300"
            >
              {Array.from({ length: 20 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>{value} slides</option>
              ))}
            </select>
            <select
              value={draft.presentationType || "Pitch Deck"}
              onChange={(event) => onDraftChange({ presentationType: event.target.value })}
              className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-300"
            >
              {presentationTypes.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <select
              value={draft.template}
              onChange={(event) => onDraftChange({ template: event.target.value })}
              className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-300"
            >
              {TEMPLATE_OPTIONS.map((template) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-200"
            >
              <Paperclip className="h-3.5 w-3.5" />
              Attach document
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onGenerateOutline}
              className="btn-secondary border-slate-600 bg-slate-900 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800"
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate outline
            </button>
            <button onClick={onGenerateAll} className="btn-primary px-5 py-2 text-sm" disabled={isGenerating}>
              {isGenerating ? <LoadingSpinner label="Generating..." /> : (
                <>
                  Generate Presentation
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {typingSuggestion({ text: typingText })}
        {promptSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onDraftChange({ topic: suggestion, prompt: suggestion })}
            className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-200"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  </section>
);

const LiveStatus = ({ title, subtitle, progress, isGenerating, onCancel }) => (
  <div className="rounded-[1.5rem] border border-cyan-300/25 bg-slate-900/75 p-4 text-slate-100 backdrop-blur-xl">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {title}
          {isGenerating ? <span className="h-4 w-0.5 animate-pulse bg-cyan-300" /> : null}
        </p>
        <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
      </div>
      {isGenerating ? (
        <button type="button" onClick={onCancel} className="btn-secondary border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700">
          <Square className="h-3.5 w-3.5" />
          Cancel
        </button>
      ) : null}
    </div>
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
      <motion.div
        className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(4, Math.min(progress, 100))}%` }}
      />
    </div>
  </div>
);

const OutlineSection = ({ draft, onOutlineChange }) => (
  <motion.section {...phaseReveal} className="rounded-[1.75rem] border border-cyan-300/20 bg-slate-900/70 p-6 text-slate-100 shadow-[0_16px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl">
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Live Outline</p>
    <h2 className="mt-2 font-display text-3xl font-bold">AI is shaping your presentation structure</h2>
    <div className="mt-5 space-y-3">
      {draft.outline.map((heading, index) => (
        <motion.label
          key={`${index}-${heading || "outline"}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
          className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3"
        >
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          <OutlineEditableField
            value={heading}
            onChange={(nextValue) => onOutlineChange(index, nextValue)}
            placeholder={`Heading ${index + 1}`}
          />
        </motion.label>
      ))}
    </div>
  </motion.section>
);

const TemplateSection = ({ draft, onTemplateChange, onGenerateSlides }) => (
  <motion.section {...phaseReveal} className="rounded-[1.75rem] border border-violet-300/20 bg-slate-900/70 p-6 text-slate-100 shadow-[0_16px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl">
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">Template Selection</p>
    <h2 className="mt-2 font-display text-3xl font-bold">Choose the visual direction</h2>
    <p className="mt-2 text-sm text-slate-300">
      Template cards below are intentionally large to preview tone, spacing, and palette before generation.
    </p>
    <div className="mt-5">
      <TemplateSelector
        templates={TEMPLATE_OPTIONS}
        selected={draft.template}
        onSelect={onTemplateChange}
        variant="carousel"
      />
    </div>
    <div className="mt-5 flex justify-end">
      <button onClick={onGenerateSlides} className="btn-primary">
        <Wand2 className="h-4 w-4" />
        Generate slides
      </button>
    </div>
  </motion.section>
);

const ActivityTimeline = ({ items }) => (
  <section className="rounded-[1.5rem] border border-slate-700 bg-slate-900/75 p-4 text-slate-100 backdrop-blur-xl">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">AI Timeline</p>
    <div className="mt-4 space-y-3">
      {items.map((item) => {
        const Icon = activityIcons[item.type] || Sparkles;
        return (
          <div key={item.id} className="flex gap-3 rounded-xl border border-slate-700 bg-slate-950/60 p-3">
            <span className="rounded-xl bg-slate-800 p-2 text-cyan-200">
              <Icon className={`h-4 w-4 ${item.type === "working" ? "animate-spin" : ""}`} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">{item.title}</p>
              <p className="text-xs text-slate-400">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

export default function CreatePresentationPage() {
  const navigate = useNavigate();
  const slidesRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingPresentation, setIsSavingPresentation] = useState(false);
  const [generationLabel, setGenerationLabel] = useState("Ready");
  const [generationSubtitle, setGenerationSubtitle] = useState("Start with a prompt and stream the presentation live.");
  const [generationPhase, setGenerationPhase] = useState("idle");
  const [typingIndex, setTypingIndex] = useState(0);
  const [liveSlides, setLiveSlides] = useState([]);
  const [liveImageStatus, setLiveImageStatus] = useState({});
  const [imageLoadingIndex, setImageLoadingIndex] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activityFeed, setActivityFeed] = useState([
    {
      id: "boot",
      type: "info",
      title: "Workspace initialized",
      description: "Prompt, stream, refine, and save inside one continuous AI studio."
    }
  ]);
  const cancelRef = useRef(false);
  const generationSessionRef = useRef(0);

  const draft = usePresentationStore((state) => state.draft);
  const setDraft = usePresentationStore((state) => state.setDraft);
  const resetDraft = usePresentationStore((state) => state.resetDraft);
  const createPresentation = usePresentationStore((state) => state.createPresentation);
  const presentations = usePresentationStore((state) => state.presentations);
  const fetchPresentations = usePresentationStore((state) => state.fetchPresentations);
  const defaultSlideCount = useSettingsStore((state) => state.defaultSlideCount);
  const defaultTemplate = useSettingsStore((state) => state.defaultTemplate);

  const outlineCount = useMemo(
    () => draft.outline.filter((item) => String(item || "").trim()).length,
    [draft.outline]
  );
  const canGenerateOutline = useMemo(() => draft.topic.trim().length >= 3, [draft.topic]);
  const typingText = promptSuggestions[typingIndex];
  const isOutlinePhase = generationPhase === "outline";
  const isTemplatePhase = generationPhase === "outlined";
  const isSlidesPhase = generationPhase === "slides" || generationPhase === "ready";

  useEffect(() => {
    const timer = setInterval(() => {
      setTypingIndex((current) => (current + 1) % promptSuggestions.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchPresentations().catch(() => {});
  }, [fetchPresentations]);

  useEffect(() => {
    if (!draft.topic && !draft.outline.length && !draft.slides.length) {
      setDraft({
        numberOfSlides: String(defaultSlideCount),
        template: defaultTemplate
      });
    }
  }, [defaultSlideCount, defaultTemplate, draft.outline.length, draft.slides.length, draft.topic, setDraft]);

  useEffect(() => {
    if (liveSlides.length && slidesRef.current) {
      slidesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [liveSlides.length]);

  const pushActivity = (title, description, type = "info") => {
    setActivityFeed((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        title,
        description
      },
      ...current
    ].slice(0, 7));
  };

  const getApiErrorMessage = (error, fallbackMessage) => {
    const apiMessage = error?.response?.data?.message;
    const apiReason = error?.response?.data?.details?.reason;
    const firstValidationError = error?.response?.data?.errors?.[0]?.msg;
    if (apiReason) return `${apiMessage} ${apiReason}`;
    if (firstValidationError) return firstValidationError;
    return apiMessage || fallbackMessage;
  };

  const updateOutlineRow = (index, value) => {
    const updated = [...(usePresentationStore.getState().draft.outline || [])];
    updated[index] = value;
    setDraft({ outline: updated });
  };

  const updateLiveSlideAt = (index, updater) => {
    setLiveSlides((currentSlides) => {
      const nextSlides = [...currentSlides];
      const currentSlide = nextSlides[index];
      nextSlides[index] = typeof updater === "function" ? updater(currentSlide) : updater;
      return nextSlides;
    });
  };

  const updateLiveSlides = (updater) => {
    setLiveSlides((currentSlides) => updater(currentSlides));
  };

  const setSlideImageStatus = (index, status) => {
    setLiveImageStatus((current) => ({
      ...current,
      [index]: status
    }));
  };

  const generateSlideImageTask = async ({
    slide,
    index,
    sessionId,
    slideBuffer,
    onTaskSettled
  }) => {
    try {
      const prompt =
        slide?.imagePrompt?.trim() || createSlideImagePrompt(draft.title || draft.topic, slide);
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        if (isStaleGeneration(sessionId)) {
          return slide;
        }

        try {
          console.debug("SLIDE IMAGE TASK START:", { index, attempt, prompt });
          setSlideImageStatus(index, "generating");
          const image = await generateImageRequest(prompt);
          setSlideImageStatus(index, "preloading");
          const preloaded = await preloadImage(image.imageUrl || image.url, {
            timeoutMs: 26000,
            retries: 2,
            retryDelayMs: 700
          });

          if (isStaleGeneration(sessionId)) {
            return slide;
          }

          const resolvedImageUrl =
            (preloaded.ok ? preloaded.url : image.imageUrl || image.url || "").trim();

          if (!resolvedImageUrl) {
            throw new Error("Generated image URL was empty.");
          }

          const enrichedSlide = {
            ...slide,
            imagePrompt: prompt,
            imageUrl: resolvedImageUrl,
            imageMeta: {
              provider: image.provider || "pexels",
              generatedAt: image.generatedAt || new Date().toISOString(),
              seed: image.seed ?? null,
              sourceUrl: image.sourceUrl || "",
              preloadAttempt: preloaded.attempt ?? 0,
              preloadOk: Boolean(preloaded.ok)
            }
          };

          slideBuffer[index] = enrichedSlide;
          setSlideImageStatus(index, "ready");
          updateLiveSlideAt(index, enrichedSlide);
          console.debug("SLIDE IMAGE TASK SUCCESS:", { index, attempt });
          return enrichedSlide;
        } catch (error) {
          console.debug("SLIDE IMAGE TASK FAILURE:", {
            index,
            attempt,
            message: error?.message || "Unknown image task error"
          });
          if (attempt >= maxAttempts) {
            setSlideImageStatus(index, "failed");
            updateLiveSlideAt(index, {
              ...slide,
              imageUrl: ""
            });
            return {
              ...slide,
              imageUrl: ""
            };
          }
        }
      }
      return slide;
    } finally {
      onTaskSettled();
    }
  };

  const queueImageHydrationRetry = (index, imageUrl, sessionId, baseMeta = {}) => {
    window.setTimeout(async () => {
      if (isStaleGeneration(sessionId) || !imageUrl) {
        return;
      }

      const retryPreload = await preloadImage(imageUrl, {
        timeoutMs: 30000,
        retries: 2,
        retryDelayMs: 750
      });

      if (isStaleGeneration(sessionId)) {
        return;
      }

      if (retryPreload.ok) {
        setSlideImageStatus(index, "ready");
        updateLiveSlideAt(index, (slide) => ({
          ...slide,
          imageUrl,
          imageMeta: {
            ...(slide?.imageMeta || {}),
            ...baseMeta,
            preloadAttempt: retryPreload.attempt ?? 0,
            preloadOk: true
          }
        }));
      } else {
        setSlideImageStatus(index, "failed");
        updateLiveSlideAt(index, (slide) => ({
          ...slide,
          imageUrl: slide?.imageUrl || "",
          imageMeta: {
            ...(slide?.imageMeta || {}),
            ...baseMeta,
            preloadAttempt: retryPreload.attempt ?? 0,
            preloadOk: false
          }
        }));
      }
    }, 3500);
  };

  const isStaleGeneration = (sessionId) => generationSessionRef.current !== sessionId || cancelRef.current;

  const resetGenerationState = () => {
    setIsGenerating(false);
    setProgress(0);
    cancelRef.current = false;
  };

  const cancelGeneration = () => {
    cancelRef.current = true;
    setGenerationSubtitle("Cancel requested. Finalizing current generation safely.");
    pushActivity("Cancel requested", "Stopping after the current step completes.", "info");
    toast.info("Generation canceled.");
  };

  const streamOutline = async () => {
    if (!canGenerateOutline) {
      toast.error("Please enter a stronger prompt.");
      return null;
    }

    cancelRef.current = false;
    setIsGenerating(true);
    setGenerationPhase("outline");
    setGenerationLabel("Generating outline...");
    setGenerationSubtitle("Streaming headings progressively.");
    setProgress(4);
    setLiveSlides([]);
    setLiveImageStatus({});
    setDraft({
      prompt: draft.topic,
      title: draft.title || draft.topic,
      outline: [],
      slides: []
    });
    pushActivity("Generating outline", "AI is drafting the slide structure.", "working");

    try {
      let finalOutline = [];
      const requestedSlides = Number(draft.numberOfSlides || 6);

      await streamOutlineRequest(
        { topic: draft.topic, numberOfSlides: requestedSlides },
        (event) => {
          if (cancelRef.current) return;

          if (event.type === "outline-item") {
            setGenerationLabel(`Generating heading ${event.index + 1} of ${requestedSlides}`);
            setGenerationSubtitle("Thinking and refining narrative flow...");
            updateOutlineRow(event.index, event.heading);
            setProgress(((event.index + 1) / Math.max(requestedSlides, 1)) * 100);
          }

          if (event.type === "done") {
            finalOutline = event.outline;
          }
        }
      );

      if (cancelRef.current) {
        resetGenerationState();
        return null;
      }

      setDraft({
        prompt: draft.topic,
        title: draft.title || draft.topic,
        outline: finalOutline
      });
      setGenerationPhase("outlined");
      setGenerationLabel("Outline complete");
      setGenerationSubtitle("Edit headings inline, then choose a template.");
      pushActivity("Outline ready", `${finalOutline.length} headings generated.`, "success");
      toast.success("Outline generated.");
      return finalOutline;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Outline generation failed."));
      pushActivity("Outline failed", "Could not generate outline from AI.", "info");
      setGenerationPhase("idle");
      return null;
    } finally {
      resetGenerationState();
    }
  };

  const streamSlides = async (outlineSource = draft.outline) => {
    const cleanOutline = (outlineSource || []).filter((item) => String(item || "").trim());
    if (!cleanOutline.length) {
      toast.error("Generate the outline first.");
      return;
    }

    cancelRef.current = false;
    const generationSessionId = Date.now();
    generationSessionRef.current = generationSessionId;
    setIsGenerating(true);
    setGenerationPhase("slides");
    setGenerationLabel("Thinking...");
    setGenerationSubtitle("Creating slides one by one.");
    setProgress(6);
    setLiveSlides(
      Array.from({ length: cleanOutline.length }, (_, index) =>
        normalizeSlideForEditor(
          {
            title: cleanOutline[index],
            bulletPoints: ["", "", "", ""],
            summary: "",
            imageUrl: "",
            imagePrompt: "",
            layoutVariant: getSlideLayoutVariant(index),
            imageStyle: { offsetX: 50, offsetY: 50, scale: 100 },
            order: index + 1
          },
          index,
          draft.title || draft.topic
        )
      )
    );
    setLiveImageStatus({});
    pushActivity("Generating slides", "Slides and visuals are streaming in live.", "working");

    try {
      const slideBuffer = new Array(cleanOutline.length);

      await streamSlidesRequest(
        { topic: draft.topic, outline: cleanOutline },
        (event) => {
          if (cancelRef.current) return;

          if (event.type === "slide") {
            const baseSlide = normalizeSlideForEditor(
              {
                ...event.slide,
                imagePrompt: createSlideImagePrompt(draft.topic, event.slide),
                imageUrl: "",
                layoutVariant: event.slide.layoutVariant || getSlideLayoutVariant(event.index),
                imageStyle: event.slide.imageStyle || { offsetX: 50, offsetY: 50, scale: 100 },
                order: event.index + 1
              },
              event.index,
              draft.title || draft.topic
            );

            slideBuffer[event.index] = baseSlide;
            setGenerationLabel(`Writing slide ${event.index + 1} of ${cleanOutline.length}`);
            setGenerationSubtitle("Generating text, layout, and image context.");
            setProgress(((event.index + 1) / Math.max(cleanOutline.length, 1)) * 74);
            setSlideImageStatus(event.index, "queued");
            updateLiveSlideAt(event.index, baseSlide);
          }
        }
      );

      if (cancelRef.current) {
        resetGenerationState();
        return;
      }

      const textSlides = cleanOutline.map((_, index) =>
        normalizeSlideForEditor(
          {
            ...slideBuffer[index],
            imageUrl: slideBuffer[index]?.imageUrl || "",
            imagePrompt:
              slideBuffer[index]?.imagePrompt ||
              createSlideImagePrompt(draft.title || draft.topic, slideBuffer[index] || {})
          },
          index,
          draft.title || draft.topic
        )
      );

      setLiveSlides(textSlides);
      setDraft({ slides: textSlides, outline: cleanOutline });

      setGenerationLabel("Generating visuals...");
      setGenerationSubtitle("Creating all slide images in parallel.");
      setProgress(76);
      pushActivity(
        "Image generation started",
        `${textSlides.length} image tasks running concurrently.`,
        "working"
      );

      let settledCount = 0;
      const imageTasks = textSlides.map((slide, index) =>
        generateSlideImageTask({
          slide,
          index,
          sessionId: generationSessionId,
          slideBuffer,
          onTaskSettled: () => {
            settledCount += 1;
            const imageProgress = 76 + (settledCount / Math.max(textSlides.length, 1)) * 22;
            setProgress(Math.min(imageProgress, 98));
          }
        })
      );

      await Promise.allSettled(imageTasks);

      if (cancelRef.current) {
        resetGenerationState();
        return;
      }

      const normalizedSlides = reindexSlides(
        slideBuffer.map((slide, index) =>
          normalizeSlideForEditor(
            {
              ...(slide || textSlides[index]),
              imageUrl:
                slide?.imageUrl ||
                textSlides[index]?.imageUrl ||
                ""
            },
            index,
            draft.title || draft.topic
          )
        )
      ).map((slide, index) =>
        normalizeSlideForEditor(slide, index, draft.title || draft.topic)
      );

      setLiveSlides(normalizedSlides);
      setDraft({ slides: normalizedSlides, outline: cleanOutline });
      setGenerationPhase("ready");
      setGenerationLabel("Presentation ready to edit");
      setGenerationSubtitle("Slides are now editable inline and can be saved.");
      setProgress(100);
      pushActivity("Slides ready", `${normalizedSlides.length} slides generated.`, "success");
      toast.success("Slides generated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Slide generation failed."));
      pushActivity("Slides failed", "Could not finish slide generation.", "info");
    } finally {
      resetGenerationState();
    }
  };

  const onGenerateAll = async () => {
    const outline = outlineCount ? draft.outline : await streamOutline();
    if (!outline || cancelRef.current) return;
    await streamSlides(outline);
  };

  const onSavePresentation = async () => {
    if (!liveSlides.length) {
      toast.error("Generate slides first.");
      return;
    }

    setIsSavingPresentation(true);
    try {
      const created = await createPresentation({
        title: draft.title || draft.topic,
        prompt: draft.prompt || draft.topic,
        template: draft.template,
        outline: draft.outline.filter((item) => String(item || "").trim()),
        slides: reindexSlides(liveSlides)
      });

      pushActivity("Presentation saved", "Deck moved to editor successfully.", "success");
      resetDraft();
      setLiveSlides([]);
      setLiveImageStatus({});
      setGenerationPhase("idle");
      toast.success("Presentation saved.");
      navigate(`/editor/${created._id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Saving presentation failed."));
    } finally {
      setIsSavingPresentation(false);
    }
  };

  const regenerateSlideImage = async (slideIndex, promptOverride = "") => {
    const slide = liveSlides[slideIndex];
    if (!slide) return;

    setImageLoadingIndex(slideIndex);
    setSlideImageStatus(slideIndex, "generating");
    pushActivity(`Regenerating slide ${slideIndex + 1} image`, "Refreshing visual context.", "working");
    try {
      const prompt =
        String(promptOverride || "").trim() ||
        slide.imagePrompt?.trim() ||
        createSlideImagePrompt(draft.title || draft.topic, slide);
      const image = await generateImageRequest(prompt);
      const preloaded = await preloadImage(image.imageUrl || image.url, {
        timeoutMs: 20000,
        retries: 2,
        retryDelayMs: 500
      });
      const resolvedImageUrl = image.imageUrl || image.url || "";
      updateLiveSlideAt(slideIndex, {
        ...slide,
        imagePrompt: prompt,
        imageUrl: resolvedImageUrl,
        imageMeta: {
          provider: image.provider || "pexels",
          generatedAt: image.generatedAt || new Date().toISOString(),
          seed: image.seed ?? null,
          sourceUrl: image.sourceUrl || "",
          preloadAttempt: preloaded.attempt ?? 0,
          preloadOk: Boolean(preloaded.ok)
        }
      });
      if (!resolvedImageUrl) {
        setSlideImageStatus(slideIndex, "failed");
      } else if (preloaded.ok) {
        setSlideImageStatus(slideIndex, "ready");
      } else {
        setSlideImageStatus(slideIndex, "loading");
        queueImageHydrationRetry(slideIndex, resolvedImageUrl, generationSessionRef.current, {
          provider: image.provider || "pexels",
          generatedAt: image.generatedAt || new Date().toISOString(),
          seed: image.seed ?? null,
          sourceUrl: image.sourceUrl || ""
        });
      }
      toast.success(`Image updated for slide ${slideIndex + 1}.`);
    } catch (error) {
      setSlideImageStatus(slideIndex, "failed");
      toast.error(error?.response?.data?.message || "Image generation failed.");
    } finally {
      setImageLoadingIndex(null);
    }
  };

  const deleteSlideImage = (slideIndex) => {
    updateLiveSlideAt(slideIndex, {
      ...liveSlides[slideIndex],
      imageUrl: ""
    });
    setSlideImageStatus(slideIndex, "failed");
  };

  const updateLiveSlideField = (slideIndex, field, value) => {
    updateLiveSlideAt(slideIndex, (slide) => ({ ...slide, [field]: value }));
  };

  const updateLiveBullet = (slideIndex, bulletIndex, value) => {
    updateLiveSlideAt(slideIndex, (slide) => {
      const bulletPoints = [...(slide.bulletPoints || [])];
      bulletPoints[bulletIndex] = value;
      return { ...slide, bulletPoints };
    });
  };

  const addLiveSlideAfter = (slideIndex) => {
    updateLiveSlides((currentSlides) => {
      const nextSlides = [...currentSlides];
      nextSlides.splice(slideIndex + 1, 0, createEmptySlide(slideIndex + 1, draft.title || draft.topic));
      return reindexSlides(nextSlides).map((slide, index) =>
        normalizeSlideForEditor(slide, index, draft.title || draft.topic)
      );
    });
  };

  const duplicateLiveSlide = (slideIndex) => {
    updateLiveSlides((currentSlides) => {
      const nextSlides = [...currentSlides];
      const source = nextSlides[slideIndex];
      nextSlides.splice(slideIndex + 1, 0, { ...source, title: `${source.title} Copy` });
      return reindexSlides(nextSlides).map((slide, index) =>
        normalizeSlideForEditor(slide, index, draft.title || draft.topic)
      );
    });
  };

  const deleteLiveSlide = (slideIndex) => {
    updateLiveSlides((currentSlides) => {
      if (currentSlides.length === 1) {
        return [createEmptySlide(0, draft.title || draft.topic)];
      }
      const nextSlides = [...currentSlides];
      nextSlides.splice(slideIndex, 1);
      return reindexSlides(nextSlides).map((slide, index) =>
        normalizeSlideForEditor(slide, index, draft.title || draft.topic)
      );
    });
  };

  const moveLiveSlide = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    updateLiveSlides((currentSlides) => {
      const nextSlides = [...currentSlides];
      const [moved] = nextSlides.splice(fromIndex, 1);
      nextSlides.splice(toIndex, 0, moved);
      return reindexSlides(nextSlides).map((slide, index) =>
        normalizeSlideForEditor(slide, index, draft.title || draft.topic)
      );
    });
  };

  return (
    <section className="space-y-6">
      <PromptComposer
        draft={draft}
        onDraftChange={setDraft}
        typingText={typingText}
        isGenerating={isGenerating}
        onGenerateOutline={streamOutline}
        onGenerateAll={onGenerateAll}
      />

      <AnimatePresence mode="wait">
        {isOutlinePhase ? (
          <motion.div key="outline-phase" {...phaseReveal} className="space-y-5">
            <LiveStatus
              title={generationLabel}
              subtitle={generationSubtitle}
              progress={progress}
              isGenerating={isGenerating}
              onCancel={cancelGeneration}
            />
            <OutlineSection draft={draft} onOutlineChange={updateOutlineRow} />
            <ActivityTimeline items={activityFeed} />
          </motion.div>
        ) : null}

        {isTemplatePhase ? (
          <motion.div key="template-phase" {...phaseReveal} className="space-y-5">
            <LiveStatus
              title={generationLabel}
              subtitle={generationSubtitle}
              progress={Math.max(progress, 100)}
              isGenerating={isGenerating}
              onCancel={cancelGeneration}
            />
            <OutlineSection draft={draft} onOutlineChange={updateOutlineRow} />
            <TemplateSection draft={draft} onTemplateChange={(template) => setDraft({ template })} onGenerateSlides={() => streamSlides()} />
          </motion.div>
        ) : null}

        {isSlidesPhase ? (
          <motion.div key="slides-phase" {...phaseReveal} className="space-y-5">
            <LiveStatus
              title={generationLabel}
              subtitle={generationSubtitle}
              progress={progress}
              isGenerating={isGenerating}
              onCancel={cancelGeneration}
            />
            <ActivityTimeline items={activityFeed} />
            <section ref={slidesRef} className="rounded-[1.75rem] border border-cyan-300/20 bg-slate-900/70 p-6 text-slate-100 shadow-[0_16px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Live Slide Canvas</p>
                  <h2 className="mt-2 font-display text-3xl font-bold">Cinematic slide-by-slide generation</h2>
                  <p className="mt-2 text-sm text-slate-300">Each slide appears progressively, then becomes directly editable.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => addLiveSlideAfter(Math.max(liveSlides.length - 1, 0))} className="btn-secondary border-slate-600 bg-slate-800 text-slate-200" disabled={!liveSlides.length || isGenerating}>
                    <PlusCircle className="h-4 w-4" />
                    Add slide
                  </button>
                  <button onClick={onSavePresentation} className="btn-primary" disabled={!liveSlides.length || isGenerating || isSavingPresentation}>
                    {isSavingPresentation ? <LoadingSpinner label="Saving..." /> : (
                      <>
                        <Save className="h-4 w-4" />
                        Save presentation
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {liveSlides.map((slide, index) => (
                  <motion.div
                    key={`${index}-${slide?.title || "placeholder"}`}
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Slide {index + 1}</p>
                      <span className="text-xs text-slate-400">
                        {liveImageStatus[index] === "queued"
                          ? "Queued for generation..."
                          : liveImageStatus[index] === "generating"
                          ? "Generating AI image..."
                          : liveImageStatus[index] === "preloading"
                            ? "Preloading visual..."
                          : liveImageStatus[index] === "loading"
                            ? "Image is still generating..."
                          : liveImageStatus[index] === "failed"
                            ? "Image unavailable. Regenerate."
                            : slide.imageUrl
                              ? "Image ready"
                              : "Streaming content"}
                      </span>
                    </div>
                    <InlineSlideCanvasEditor
                      slide={slide}
                      index={index}
                      template={draft.template}
                      zoom={100}
                      isImageLoading={
                        imageLoadingIndex === index ||
                        ["queued", "generating", "preloading", "loading"].includes(liveImageStatus[index])
                      }
                      onFieldChange={(field, value) => updateLiveSlideField(index, field, value)}
                      onBulletChange={(bulletIndex, value) => updateLiveBullet(index, bulletIndex, value)}
                      onRegenerateImage={(promptOverride) =>
                        regenerateSlideImage(index, promptOverride)
                      }
                      onDeleteImage={() => deleteSlideImage(index)}
                      onDuplicate={() => duplicateLiveSlide(index)}
                      onDeleteSlide={() => deleteLiveSlide(index)}
                      onAddAfter={() => addLiveSlideAfter(index)}
                      onCycleLayout={() => updateLiveSlideField(index, "layoutVariant", getNextSlideLayoutVariant(slide.layoutVariant))}
                      onDragStart={() => setDraggingIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggingIndex === null) return;
                        moveLiveSlide(draggingIndex, index);
                        setDraggingIndex(null);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!isOutlinePhase && !isTemplatePhase && !isSlidesPhase ? (
        <motion.section {...phaseReveal} className="rounded-[1.75rem] border border-slate-700 bg-slate-900/70 p-6 text-slate-100 shadow-[0_16px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Recent presentations</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Continue your previous work</h2>
          <div className="mt-5 space-y-3">
            {presentations.slice(0, 5).map((presentation) => (
              <button
                key={presentation._id}
                onClick={() => navigate(`/editor/${presentation._id}`)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-left transition hover:border-cyan-300/40 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.25)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-100">{presentation.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{presentation.slideCount || 0} slides - {presentation.template}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
            {!presentations.length ? (
              <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-400">
                No presentations yet. Start by describing your first deck above.
              </p>
            ) : null}
          </div>
        </motion.section>
      ) : null}
    </section>
  );
}
