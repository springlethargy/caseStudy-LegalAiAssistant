import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="fixed top-0 right-0 p-4">
        <ThemeToggle />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="max-w-5xl w-full text-center">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Ask UCASS
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your AI assistant for answering questions about UCASS
          </p>
          <Link href="/chat">
            <Button size="lg">Start Chatting</Button>
          </Link>
        </div>
      </main>
    </>
  );
}
