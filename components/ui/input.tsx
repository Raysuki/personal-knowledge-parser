import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-stone-100 shadow-sm outline-none transition placeholder:text-stone-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
