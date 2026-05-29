import { useEffect, useRef } from "react";
import { Chrome } from "lucide-react";
import { toast } from "react-toastify";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function GoogleSignInButton({ onCredential, disabled = false }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    const mountButton = () => {
      if (!buttonRef.current || !GOOGLE_CLIENT_ID) {
        return;
      }

      if (!window.google?.accounts?.id) {
        if (attempt < 20 && !cancelled) {
          attempt += 1;
          window.setTimeout(mountButton, 250);
        }
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await onCredential(response.credential);
          } catch (error) {
            toast.error(error?.response?.data?.message || "Google sign-in failed.");
          }
        }
      });

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 320,
        text: "continue_with"
      });
    };

    mountButton();

    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        className="btn-secondary w-full justify-center opacity-70"
        title="Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in"
      >
        <Chrome className="h-4 w-4" />
        Continue with Google
      </button>
    );
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-70" : ""}>
      <div ref={buttonRef} className="min-h-[44px]" />
    </div>
  );
}
