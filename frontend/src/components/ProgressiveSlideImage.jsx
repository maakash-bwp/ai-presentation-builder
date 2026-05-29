import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export default function ProgressiveSlideImage({
  slide,
  className,
  style,
  showLoadingState = true,
  allowDrag = false,
  onMouseDown
}) {
  const [loaded, setLoaded] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(slide?.imageUrl || "");
  const [retryCount, setRetryCount] = useState(0);
  const [terminalRetryCount, setTerminalRetryCount] = useState(0);
  const [recoveryAttempt, setRecoveryAttempt] = useState(0);
  const [hasError, setHasError] = useState(false);
  const retryTimerRef = useRef(null);

  useEffect(() => {
    setLoaded(Boolean(slide?.imageMeta?.preloadOk && slide?.imageUrl));
    setResolvedSrc(slide?.imageUrl || "");
    setRetryCount(0);
    setTerminalRetryCount(0);
    setRecoveryAttempt(0);
    setHasError(false);

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [slide?.imageUrl]);

  useEffect(() => {
    if (slide?.imageUrl && slide?.imageMeta?.preloadOk) {
      setLoaded(true);
    }
  }, [slide?.imageMeta?.preloadOk, slide?.imageUrl]);

  useEffect(() => {
    if (!hasError) {
      return;
    }

    const canonical = String(slide?.imageUrl || "").trim();
    if (!canonical || canonical.startsWith("data:image")) {
      return;
    }

    if (recoveryAttempt >= 12) {
      return;
    }

    const nextAttempt = recoveryAttempt + 1;
    retryTimerRef.current = setTimeout(() => {
      console.debug("SLIDE IMAGE RECOVERY RETRY:", { retry: nextAttempt, canonical });
      setRecoveryAttempt(nextAttempt);
      setRetryCount(0);
      setTerminalRetryCount(0);
      setHasError(false);
      setLoaded(false);
      setResolvedSrc(`${canonical}${canonical.includes("?") ? "&" : "?"}rr=${Date.now()}-${nextAttempt}`);
    }, Math.min(1400 + nextAttempt * 900, 7000));

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [hasError, recoveryAttempt, slide?.imageUrl]);

  if (!resolvedSrc || hasError) {
    if (!showLoadingState) {
      return null;
    }
    return (
      <div className={clsx(className, "image-skeleton flex items-center justify-center text-slatePro-400")}>
        <span className="relative z-10 text-sm">
          {hasError ? "Image unavailable. Regenerate." : "Generating image..."}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx("relative overflow-hidden", className)}>
      {!loaded ? (
        <div className="absolute inset-0 image-skeleton" />
      ) : null}
      <img
        key={resolvedSrc}
        src={resolvedSrc}
        alt={slide?.title || "Slide image"}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className={clsx(
          "h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          allowDrag ? "cursor-move" : ""
        )}
        style={style}
        onMouseDown={allowDrag ? onMouseDown : undefined}
        onLoad={() => setLoaded(true)}
        onError={(event) => {
          const stableSrc = String(slide?.imageUrl || resolvedSrc || "").trim();

          if (retryCount < 2 && stableSrc && !stableSrc.startsWith("data:image")) {
            const nextRetry = retryCount + 1;
            setRetryCount(nextRetry);
            const retryUrl = `${stableSrc}${stableSrc.includes("?") ? "&" : "?"}r=${Date.now()}-${nextRetry}`;
            console.debug("SLIDE IMAGE RETRY:", { title: slide?.title, retry: nextRetry, retryUrl });
            retryTimerRef.current = setTimeout(() => {
              setResolvedSrc(retryUrl);
              setLoaded(false);
            }, nextRetry * 700);
            return;
          }

          if (terminalRetryCount < 3 && stableSrc && !stableSrc.startsWith("data:image")) {
            const nextTerminalRetry = terminalRetryCount + 1;
            setTerminalRetryCount(nextTerminalRetry);
            console.debug("SLIDE IMAGE TERMINAL RETRY:", {
              title: slide?.title,
              retry: nextTerminalRetry
            });
            retryTimerRef.current = setTimeout(() => {
              setRetryCount(0);
              setHasError(false);
              setLoaded(false);
              setResolvedSrc(
                `${stableSrc}${stableSrc.includes("?") ? "&" : "?"}tr=${Date.now()}-${nextTerminalRetry}`
              );
            }, 1200 * nextTerminalRetry);
            return;
          }

          event.currentTarget.onerror = null;
          console.debug("SLIDE IMAGE FAILED:", { title: slide?.title, source: resolvedSrc });
          setResolvedSrc("");
          setHasError(true);
          setLoaded(false);
        }}
      />
    </div>
  );
}
