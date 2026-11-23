import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export existing components if they exist, otherwise define basic ones
export * from "./badge";
export * from "./button";
export * from "./card";
export * from "./input";

// Define missing components
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    className={cn(
      "peer h-6 w-11 cursor-pointer appearance-none rounded-full bg-slate-200 transition-colors checked:bg-orange-500",
      className
    )}
    ref={ref}
    {...props}
  />
));
Switch.displayName = "Switch";

// Form Components (Simplified)
export const Form = ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => (
  <form {...props}>{children}</form>
);
export const FormField = ({ children }: { children: React.ReactNode }) => <div className="space-y-2">{children}</div>;
export const FormItem = ({ children }: { children: React.ReactNode }) => <div className="space-y-1">{children}</div>;
export const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>
    {children}
  </label>
);
export const FormControl = ({ children }: { children: React.ReactNode }) => <div className="relative">{children}</div>;
export const FormMessage = ({ children }: { children?: React.ReactNode }) => (
  <p className="text-sm font-medium text-destructive">{children}</p>
);

// Select Components (Simplified using native select for stability)
export const Select = ({ children, ...props }: any) => <div className="relative">{children}</div>;
export const SelectTrigger = ({ children, className, ...props }: any) => (
  <div className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm", className)} {...props}>
    {children}
  </div>
);
export const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;
export const SelectContent = ({ children }: any) => <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">{children}</div>;
export const SelectItem = ({ value, children }: any) => <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground">{children}</div>;

// Table Components
export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="relative w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
);
export const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("[&_tr]:border-b", className)} {...props} />
);
export const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);
export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />
);
export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)} {...props} />
);
export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
);
export const TableCaption = ({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) => (
  <caption className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
);

// Toast Components
export const Toaster = () => <div id="toaster" />;
export const Toast = ({ children }: any) => <div>{children}</div>;
export const toast = (props: any) => console.log("Toast:", props);

// Missing Admin Components
export const Label = ({ children, className, ...props }: any) => (
  <label className={cn("text-sm font-medium leading-none", className)} {...props}>{children}</label>
);

export const Separator = ({ className }: any) => <div className={cn("h-[1px] w-full bg-slate-200 dark:bg-slate-800", className)} />;

export const Alert = ({ children, className, variant }: any) => (
  <div className={cn("p-4 rounded-lg border", variant === 'success' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-slate-50 border-slate-200 text-slate-800', className)}>{children}</div>
);
export const AlertTitle = ({ children, className }: any) => <h5 className={cn("font-bold mb-1", className)}>{children}</h5>;
export const AlertDescription = ({ children, className }: any) => <div className={cn("text-sm opacity-90", className)}>{children}</div>;

export const VStack = ({ children, className, spacing = 4 }: any) => (
  <div className={cn("flex flex-col", className)} style={{ gap: `${spacing * 4}px` }}>{children}</div>
);
export const HStack = ({ children, className, spacing = 4, justify }: any) => (
  <div className={cn("flex flex-row", className)} style={{ gap: `${spacing * 4}px`, justifyContent: justify }}>{children}</div>
);

// Radio & Checkbox (Simplified)
export const RadioGroup = ({ children, onValueChange }: any) => <div className="space-y-2">{children}</div>;
export const RadioGroupItem = ({ children }: any) => <div className="flex items-center gap-2">{children}</div>;
export const RadioGroupLabel = ({ children, className }: any) => <div className={className}>{children}</div>;
export const Radio = ({ className }: any) => <div className={cn("w-4 h-4 rounded-full border border-orange-500", className)} />;

export const CheckboxGroup = ({ children, onValueChange }: any) => <div className="space-y-2">{children}</div>;
export const CheckboxGroupItem = ({ children }: any) => <div className="flex items-center gap-2">{children}</div>;
export const CheckboxGroupLabel = ({ children, className }: any) => <div className={className}>{children}</div>;
export const Checkbox = ({ className }: any) => <div className={cn("w-4 h-4 rounded border border-orange-500", className)} />;
