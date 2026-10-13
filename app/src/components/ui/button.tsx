import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// shadcn/ui Button, restyled to the Quilted Languages tokens: blue fill with
// white text, or an ink outline; 6px radius; 44px minimum height.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] border-[1.5px] font-sans font-semibold transition-[background-color,color,border-color] duration-[var(--dur-fast)] disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border-blue bg-blue text-white hover:border-ink hover:bg-ink",
        secondary: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
      },
      size: {
        default: "min-h-11 px-5 py-2.5 text-base",
        lg: "min-h-12 px-6 py-3 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
