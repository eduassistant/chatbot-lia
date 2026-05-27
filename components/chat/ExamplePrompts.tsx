"use client";

const examplePrompts = [
  "Me siento sobrepasado con la universidad",
  "No sé cómo organizarme para estudiar",
  "Estoy pensando en abandonar una materia",
];

interface ExamplePromptsProps {
  disabled?: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export function ExamplePrompts({ disabled = false, onSelectPrompt }: ExamplePromptsProps) {
  return (
    <div className="my-5">
      <p className="mb-3 text-sm text-muted-foreground">Algunos ejemplos:</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {examplePrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(prompt)}
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-left text-sm font-medium text-secondary-foreground transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden="true">✦</span>
            <span>{prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
