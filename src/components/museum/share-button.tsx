import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  getXIntentUrl,
  SHARE_TEXT,
  VERDICT_SHARE_TEXT,
} from "@/lib/share";
import { recordMuseumEvent } from "@/lib/museum-stats";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
type ButtonSize = VariantProps<typeof buttonVariants>["size"];

type Props = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  label?: string;
  /** Share body text (URL is appended automatically). */
  text?: string;
  /** Use the verdict-specific copy. */
  mode?: "default" | "verdict";
};

/**
 * Real X Web Intent link (`<a href="https://twitter.com/intent/tweet?...">`).
 * Not Web Share API, not window.open-only — middle-click / new tab work.
 */
export function ShareButton({
  variant = "secondary",
  size = "sm",
  className,
  label = "Xでシェア",
  text,
  mode = "default",
}: Props) {
  const [status, setStatus] = useState<"idle" | "ok">("idle");
  const shareText =
    text ?? (mode === "verdict" ? VERDICT_SHARE_TEXT : SHARE_TEXT);

  // Stable text-only intent for SSR/hydration; attach page URL after mount.
  const [intentHref, setIntentHref] = useState(() => getXIntentUrl(shareText, ""));

  useEffect(() => {
    setIntentHref(getXIntentUrl(shareText));
  }, [shareText]);

  function onShare() {
    void recordMuseumEvent("share");
    setStatus("ok");
    window.setTimeout(() => setStatus("idle"), 2200);
  }

  return (
    <a
      href={intentHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onShare}
      aria-label="X（Twitter）でシェア"
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {status === "ok" ? (
        <Check className="h-4 w-4" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {size !== "icon" && (
        <span>{status === "ok" ? "Xを開きました" : label}</span>
      )}
    </a>
  );
}
