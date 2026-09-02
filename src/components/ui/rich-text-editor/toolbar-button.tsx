import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />;
}

export function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-xs"
      className={cn("size-7 text-muted-foreground", active && "text-foreground")}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
