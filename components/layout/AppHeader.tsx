import Image from "next/image";

const EDUASSISTANT_LOGO_URL =
  "https://res.cloudinary.com/dfoxsvhei/image/upload/v1779874591/eduassistant-circle-white_wjx9oh.png";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary p-1 shadow-sm">
            <Image
              src={EDUASSISTANT_LOGO_URL}
              alt="Logo de Eduassistant"
              width={36}
              height={36}
              priority
              className="h-9 w-9 rounded-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              LIA — Asistente estudiantil
            </h1>
            <p className="hidden text-sm text-muted-foreground sm:block">Entorno de validación RAG</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground sm:text-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="hidden sm:inline">Backend conectado</span>
          <span className="sm:hidden">Conectado</span>
        </div>
      </div>
    </header>
  );
}
