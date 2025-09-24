"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function InterviewClosingPage() {

  function handleClose() {
    window.close();
    // The instruction states that the main page should not load when closing the window.
    // Therefore, the navigation to the homepage is removed.
  }
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 sm:p-10 bg-[url('/images/bg-blue.png')] bg-cover bg-no-repeat bg-center">
      <div className="relative rounded-3xl overflow-hidden border-0 shadow-2xl max-w-xl w-full bg-card">
        <div
          className="absolute inset-0 bg-[url('/images/frame-team-blue.png')] bg-center opacity-90"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-white/75 dark:bg-black/40"
          aria-hidden
        />
        <div className="relative p-6 sm:p-10 flex flex-col items-center text-center gap-5">
          <div className="w-full flex items-center justify-center py-2 mb-4">
            <Image src="/images/acciona-play.svg" alt="Acciona Play" width={260} height={36} />
          </div>
          <h1 className="text-2xl font-semibold text-primary">
            Thank you for your time
          </h1>
          <p className="text-muted-foreground">
            The interview has concluded. Our team will review your responses and
            contact you with the next steps. Meanwhile, you can close this
            window or return to the homepage.
          </p>
          <div className="flex mt-2">
            <Button className="rounded-full" size="lg" onClick={handleClose}>
              Close window
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
