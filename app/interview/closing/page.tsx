'use client';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function InterviewClosingPage() {
  const router = useRouter();

  function handleClose() {
    window.close();
    setTimeout(() => router.push("/"), 50);
  }
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 sm:p-10">
      <div className="relative rounded-3xl overflow-hidden border-0 shadow-2xl max-w-xl w-full bg-card">
        <div
          className="absolute inset-0 bg-[url('/images/frame-team-blue.png')] bg-center opacity-90"
          aria-hidden
        />
        <div className="absolute inset-0 bg-white/75 dark:bg-black/40" aria-hidden />
        <div className="relative p-8 sm:p-10 flex flex-col items-center text-center gap-6">
          <h1 className="text-2xl font-semibold text-primary">Gracias por tu tiempo</h1>
          <p className="text-muted-foreground">
            Hemos finalizado la entrevista. Nuestro equipo revisará tus respuestas y
            te contactará con los próximos pasos. Mientras tanto, puedes cerrar
            esta ventana o volver al inicio.
          </p>
          <div className="flex mt-2">
            <Button className="rounded-full" size="lg" onClick={handleClose}>Cerrar ventana</Button>
          </div>
        </div>
      </div>
    </div>
  );
}


