export function TypingIndicator() {
  return (
    <div className="mt-4 flex justify-start">
      <div className="rounded-2xl rounded-bl-sm border border-border bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm">
        LIA está pensando<span className="animate-pulse">...</span>
      </div>
    </div>
  );
}
