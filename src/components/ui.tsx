"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cx } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

const buttonBase =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-all ease-fluid " +
  "will-change-transform active:scale-[0.975] active:duration-75 " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "sheen bg-brand-600 text-white shadow-[0_1px_0_oklch(1_0_0/0.28)_inset,0_-1px_0_oklch(0_0_0/0.15)_inset,0_6px_18px_-6px_var(--color-brand-600)] " +
    "hover:-translate-y-px hover:bg-brand-500 hover:shadow-[0_1px_0_oklch(1_0_0/0.32)_inset,0_-1px_0_oklch(0_0_0/0.15)_inset,0_12px_26px_-8px_var(--color-brand-500)]",
  secondary: "glass text-ink hover:-translate-y-px hover:border-brand-400/40 hover:shadow-elevated",
  ghost: "text-ink-muted hover:bg-ink/8 hover:text-ink",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize) {
  return cx(buttonBase, buttonVariants[variant], buttonSizes[size]);
}

function TrailingIcon({ children, size }: { children: ReactNode; size: ButtonSize }) {
  return (
    <span
      aria-hidden
      className={cx(
        "-mr-1 grid place-items-center rounded-full bg-current/15 transition-transform duration-300 ease-fluid",
        "group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105",
        size === "sm" ? "size-5 text-[10px]" : "size-6 text-xs",
      )}
    >
      {children}
    </span>
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button className={cx(buttonClasses(variant, size), className)} {...props}>
      {children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cx(buttonClasses(variant, size), className)} {...props}>
      {children}
      {icon && <TrailingIcon size={size}>{icon}</TrailingIcon>}
    </Link>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        "border-brand-200 bg-brand-50 text-brand-700 transition-colors duration-200 ease-fluid",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Brand({ size = "sm", className }: { size?: "sm" | "md"; className?: string }) {
  return (
    <span className={cx("group flex items-center gap-2", className)}>
      <Image
        src="/logo-app-icon.png"
        alt=""
        width={56}
        height={56}
        priority
        className={cx(
          "shrink-0 rounded-[22%] object-contain transition-transform duration-500 ease-fluid group-hover:scale-105",
          size === "md" ? "size-7" : "size-6",
        )}
      />
      <span
        className={cx(
          "font-semibold tracking-tight whitespace-nowrap",
          size === "md" ? "text-lg" : "text-sm",
        )}
      >
        <span className="text-ink">Leed</span>
        <span className="text-brand-500">fly</span>
      </span>
    </span>
  );
}

export function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || event.pointerType === "touch") return;

    const box = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${event.clientX - box.left}px`);
    node.style.setProperty("--my", `${event.clientY - box.top}px`);
  }

  return (
    <div ref={ref} onPointerMove={onMove} className={cx("spotlight", className)}>
      {children}
    </div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    if (typeof IntersectionObserver === "undefined") {
      const frameId = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-visible={visible}
      className={cx("reveal", className)}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
