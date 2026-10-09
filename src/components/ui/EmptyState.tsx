import Link from "next/link";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  /** hide the "go home" button */
  hideAction?: boolean;
  children?: React.ReactNode;
}

/** 404-style message with the "হোম পেজে ফিরে যান" call to action. */
export function EmptyState({ emoji = "🧺", title, description, hideAction = false, children }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-6 py-12 text-center">
      <span aria-hidden="true" className="grid size-16 place-items-center rounded-2xl bg-base-200 text-4xl">
        {emoji}
      </span>
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-sm opacity-70">{description}</p>}
      {children}
      {!hideAction && (
        <Link href="/" className="btn btn-primary mt-2 font-semibold">
          হোম পেজে ফিরে যান
        </Link>
      )}
    </div>
  );
}
