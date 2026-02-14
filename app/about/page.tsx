import { Header } from '@/components/Header';
import Balatro from '@/components/Balatro';

export const metadata = {
  title: "ABOUT // THE_BORING_NEWS",
  description: "Why we built a boring tech news aggregator.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-mono text-black dark:text-white relative selection:bg-pink-500 selection:text-white">
      {/* Background Layer (Consistent with Home) */}
      <div className="fixed inset-0 z-0 pointer-events-auto opacity-30 dark:opacity-50 mix-blend-overlay">
        <Balatro 
          isRotate={true} 
          mouseInteraction={true}
          pixelFilter={700}
        />
      </div>

       {/* Grid Overlay */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-4xl flex-1 flex flex-col gap-10 sm:gap-16">
          
          {/* Header Block */}
          <header className="border-b-4 border-black dark:border-white pb-6 sm:pb-8">
            <h1 className="font-boldonse font-bold text-3xl sm:text-4xl md:text-5xl lg:text-7xl uppercase tracking-tighter mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-500 dark:from-white dark:to-zinc-500 break-words">
              About_<br/><span className="text-pink-500">Project</span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-500">
              // MANIFESTO_V1.0
            </p>
          </header>
            
            <section className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mt-2">
                01 // PURPOSE
              </h2>
              <div className="text-lg md:text-xl leading-relaxed font-bold">
                <p className="mb-6">
                   THE_BORING_NEWS EXISTS TO SOLVE A SPECIFIC PROBLEM: <span className="text-pink-500">INFORMATION_OVERLOAD</span>.
                </p>
                <p className="text-base md:text-lg opacity-80">
                  Technology moves fast, but the noise surrounding it moves faster. We built this merely to be a calm, quiet place where you can find relevant updates without fighting for your attention.
                </p>
              </div>
            </section>

             {/* Gemini Integration Section - Hard Borders */}
             <section className="border-2 border-black dark:border-white p-6 md:p-12 relative overflow-hidden bg-white dark:bg-black">
               <div className="absolute top-0 right-0 p-2 bg-black text-white dark:bg-white dark:text-black font-bold uppercase text-xs tracking-widest border-l-2 border-b-2 border-inherit">
                 AI_INTEGRATION
               </div>
               
              <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start relative z-10">
                 <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mt-2">
                  02 // ENGINE
                </h2>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold uppercase mb-6 tracking-tight">
                    Powered by <span className="text-pink-500">Gemini 1.5 Flash</span>
                  </h3>
                  
                  <div className="grid gap-8">
                    <div>
                      <h4 className="font-bold uppercase tracking-wider mb-2 border-b-2 border-black dark:border-white inline-block pb-1">
                        Smart Summarization
                      </h4>
                      <p className="text-sm opacity-80 leading-relaxed">
                        We use Google's Gemini model to read every article. Instead of generic excerpts, we generate a concise "hook" and exactly two key insights per story.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold uppercase tracking-wider mb-2 border-b-2 border-black dark:border-white inline-block pb-1">
                        Intelligent Extraction
                      </h4>
                      <p className="text-sm opacity-80 leading-relaxed">
                        Our ingestion engine uses advanced DOM parsing to find high-quality imagery, ensuring a visual consistency across the feed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
               {/* Decorative Background Grid inside card */}
               <div className="absolute inset-0 z-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:8px_8px] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-5 pointer-events-none" />
            </section>

            <section className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mt-2">
                03 // PHILOSOPHY
              </h2>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                   <span className="font-bold text-pink-500">[A]</span>
                   <div>
                      <strong className="block uppercase tracking-wider mb-1">Signal over noise</strong>
                      <span className="opacity-70 text-sm">Most platforms prioritize engagement. We prioritize clarity.</span>
                   </div>
                </li>
                <li className="flex gap-4 items-start">
                   <span className="font-bold text-pink-500">[B]</span>
                   <div>
                      <strong className="block uppercase tracking-wider mb-1">Distraction-free</strong>
                      <span className="opacity-70 text-sm">No infinite feeds of doom, no outrage bait.</span>
                   </div>
                </li>
                 <li className="flex gap-4 items-start">
                   <span className="font-bold text-pink-500">[C]</span>
                   <div>
                      <strong className="block uppercase tracking-wider mb-1">Compassionate Filter</strong>
                      <span className="opacity-70 text-sm">We don't host the content; we just help you find it.</span>
                   </div>
                </li>
              </ul>
            </section>

             <section className="bg-black text-white dark:bg-white dark:text-black p-8 md:p-12">
               <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter mb-4">
                 "Boring software is software that works."
               </h2>
               <p className="font-mono text-sm uppercase tracking-widest opacity-70">
                 // PREDICTABLE. STABLE. RELIABLE.
               </p>
            </section>
        </main>

        <footer className="border-t-2 border-black dark:border-white bg-white dark:bg-black py-8 mt-auto z-20">
           <div className="container mx-auto px-4 text-center">
             <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
               © {new Date().getFullYear()} THE_BORING_PROJECT // ENGINEERED_TO_BE_DULL
             </p>
           </div>
        </footer>
      </div>
    </div>
  );
}
