import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { trackCustomEvent } from "@/lib/analytics";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary shadow hover:bg-primary/90 text-white",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-white shadow-sm hover:bg-background hover:text-muted",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-background hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  analyticsName?: string;
  analyticsCategory?: string;
  analyticsParams?: Record<string, any>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, analyticsName, analyticsCategory, analyticsParams, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const findClosestCommunityContext = (start: HTMLElement | null) => {
      let el: HTMLElement | null = start;
      while (el && el !== document.body && el !== document.documentElement) {
        const id = el.getAttribute?.("data-community-id");
        const name = el.getAttribute?.("data-community-name");
        if (id || name) return { community_id: id || undefined, community_name: name || undefined };
        el = el.parentElement;
      }
      return {} as { community_id?: string; community_name?: string };
    };
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      try {
        const target = e.currentTarget as HTMLElement | null;
        const inferredName =
          analyticsName ||
          target?.getAttribute("data-analytics-name") ||
          (typeof props.children === "string" ? props.children : target?.textContent?.trim()?.slice(0, 80) || undefined);
        const context = findClosestCommunityContext(target);
        const payload = {
          name: inferredName,
          variant,
          size,
          category: analyticsCategory || "ui",
          page_location: typeof window !== "undefined" ? window.location.href : undefined,
          page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
          page_title: typeof document !== "undefined" ? document.title : undefined,
          ...context,
          ...(analyticsParams || {}),
        } as Record<string, any>;
        // Console visibility
        try { console.log("[analytics] button_click", payload); } catch {}
        trackCustomEvent("button_click", payload);
      } catch {}
      onClick?.(e);
    };
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
