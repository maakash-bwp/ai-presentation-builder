import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from "lucide-react";
import { toast } from "react-toastify";
import { usePresentationStore } from "../store/presentationStore";
import LoadingSpinner from "../components/LoadingSpinner";
import SlideCanvasPreview from "../components/SlideCanvasPreview";

export default function PresentationModePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [index, setIndex] = useState(0);
  const [presentation, setPresentation] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef(null);

  const fetchPresentationById = usePresentationStore((state) => state.fetchPresentationById);
  const isLoading = usePresentationStore((state) => state.isLoading);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPresentationById(id);
        setPresentation(data);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load presentation.");
        navigate("/dashboard");
      }
    };
    load();
  }, [fetchPresentationById, id, navigate]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        setIndex((prev) => Math.min(prev + 1, (presentation?.slides?.length || 1) - 1));
      }
      if (event.key === "ArrowLeft") {
        setIndex((prev) => Math.max(prev - 1, 0));
      }
      if (event.key === "Escape") {
        navigate(`/editor/${id}`);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [id, navigate, presentation?.slides?.length]);

  const toggleFullscreen = async () => {
    if (!rootRef.current) return;

    if (!document.fullscreenElement) {
      await rootRef.current.requestFullscreen();
      setIsFullscreen(true);
      return;
    }

    await document.exitFullscreen();
    setIsFullscreen(false);
  };

  if (isLoading || !presentation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slatePro-900 text-white">
        <LoadingSpinner label="Loading presentation..." />
      </div>
    );
  }

  const currentSlide = presentation.slides[index];

  return (
    <div ref={rootRef} className="min-h-screen bg-slatePro-900 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold">{presentation.title}</h1>
            <p className="text-sm text-slatePro-300">
              Slide {index + 1} of {presentation.slides.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="btn-secondary border-slatePro-700 bg-slatePro-800 text-white hover:bg-slatePro-700"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => navigate(`/editor/${id}`)}
              className="btn-secondary border-slatePro-700 bg-slatePro-800 text-white hover:bg-slatePro-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1">
          <SlideCanvasPreview
            slide={currentSlide}
            index={index}
            template={presentation.template}
            className="h-full min-h-[70vh] bg-white"
          />
        </div>

        <footer className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
            disabled={index === 0}
            className="btn-secondary border-slatePro-700 bg-slatePro-800 text-white hover:bg-slatePro-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={() => setIndex((prev) => Math.min(prev + 1, presentation.slides.length - 1))}
            disabled={index === presentation.slides.length - 1}
            className="btn-secondary border-slatePro-700 bg-slatePro-800 text-white hover:bg-slatePro-700"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </footer>
      </div>
    </div>
  );
}
