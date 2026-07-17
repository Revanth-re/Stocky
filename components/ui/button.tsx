// import * as React from "react";
// import { Slot } from "@radix-ui/react-slot";
// import { cva, type VariantProps } from "class-variance-authority";
// import { cn } from "@/lib/utils";

// const buttonVariants = cva(
//   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
//   {
//     variants: {
//       variant: {
//         default:
//           "bg-gradient-brand text-white shadow-soft hover:opacity-90 active:opacity-95",
//         secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
//         outline: "border border-border bg-card hover:bg-muted",
//         ghost: "hover:bg-muted text-foreground",
//         destructive: "bg-destructive text-white hover:opacity-90",
//         link: "text-primary underline-offset-4 hover:underline",
//       },
//       size: {
//         default: "h-11 px-5 py-2",
//         sm: "h-9 rounded-lg px-3 text-xs",
//         lg: "h-13 rounded-xl px-8 text-base",
//         icon: "size-10",
//       },
//     },
//     defaultVariants: { variant: "default", size: "default" },
//   },
// );

// export interface ButtonProps
//   extends React.ButtonHTMLAttributes<HTMLButtonElement>,
//     VariantProps<typeof buttonVariants> {
//   asChild?: boolean;
//   loading?: boolean;
// }

// const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
//   ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
//     const Comp = asChild ? Slot : "button";
//     return (
//       <Comp
//         ref={ref}
//         className={cn(buttonVariants({ variant, size, className }))}
//         disabled={disabled || loading}
//         {...props}
//       >
//         {loading ? (
//           <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//         ) : null}
//         {children}
//       </Comp>
//     );
//   },
// );
// Button.displayName = "Button";

// export { Button, buttonVariants };
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-brand text-white shadow-soft hover:opacity-90 active:opacity-95",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
        outline: "border border-border bg-card hover:bg-muted",
        ghost: "hover:bg-muted text-foreground",
        destructive: "bg-destructive text-white hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Radix's <Slot> (used when asChild) requires exactly one child element.
    // Only inline the loading spinner for real <button> elements — when
    // asChild is set, pass `children` straight through untouched.
    const content = asChild ? (
      children
    ) : (
      <>
        {loading ? (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </>
    );

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };