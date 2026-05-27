import { ChatExperience } from "@/components/chat/ChatExperience";
import { AppHeader } from "@/components/layout/AppHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <ChatExperience />
    </main>
  );
}
