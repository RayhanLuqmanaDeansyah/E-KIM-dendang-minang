import KimCard from "@/components/KimCard";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-10 w-full px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-kim-primary mb-4">
          Selamat Datang di KIM Minangkabau
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">
          Mari bernyanyi dan bermain! Tebak angka dari pantun yang dilantunkan, coret grid-mu, dan raih kemenangan.
        </p>
        <div className="flex justify-center gap-4 mb-8">
          <Link href="/login" className="bg-kim-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-red-800 transition-colors">
            Mulai Bermain (Login)
          </Link>
        </div>
      </div>
      
      <div className="opacity-80 pointer-events-none scale-90 md:scale-100">
        <KimCard colorPhase="pink" />
      </div>
    </div>
  );
}
