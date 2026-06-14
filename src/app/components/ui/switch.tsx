"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border outline-none transition-all",
        "focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950",
        "data-[state=unchecked]:bg-blue-950/70 data-[state=unchecked]:border-blue-500/45",
        "data-[state=checked]:border-sky-400/60 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-sky-500 data-[state=checked]:to-blue-600",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full shadow-md ring-0 transition-transform",
          "bg-sky-100 shadow-blue-900/40",
          "data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-5 data-[state=checked]:bg-white",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
