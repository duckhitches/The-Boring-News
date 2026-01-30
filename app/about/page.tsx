import { Header } from '@/components/Header';
import Balatro from '@/components/Balatro';

export const metadata = {
  title: "About - The Boring News",
  description: "Why we built a boring tech news aggregator.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 relative">
      {/* Background Layer (Consistent with Home) */}
      <div className="fixed inset-0 z-0 pointer-events-auto backdrop-blur-lg">
        <Balatro 
          isRotate={true} 
          mouseInteraction={true}
          pixelFilter={700}
        />
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <article className="prose prose-zinc dark:prose-invert lg:prose-lg bg-white/50 dark:bg-zinc-900/50 p-8 rounded-2xl backdrop-blur-md shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
            <h1 className="font-boldonse font-bold text-4xl mb-6">About The Boring News</h1>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold font-mono mb-4 flex items-center gap-2">
                Purpose of the Page
              </h2>
              <p className="text-zinc-700 font-mono dark:text-zinc-300 leading-relaxed">
                The Boring News exists to solve a specific problem: <strong>information overload in the developer ecosystem</strong>. 
                Technology moves fast, but the noise surrounding it moves faster. We built this merely to be a calm, quiet place 
                where you can find relevant updates without fighting for your attention.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold font-mono mb-4">Why this project exists</h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-700 font-mono dark:text-zinc-300">
                <li>
                  <strong>Signal over noise.</strong> Most platforms prioritize engagement over information. We prioritize clarity.
                </li>
                <li>
                  <strong>Distraction-free.</strong> No infinite feeds of doom, no outrage bait, no "you won't believe what happened next."
                </li>
                <li>
                  <strong>A Clean Discovery Layer.</strong> We don't host the content; we just help you find it. Think of us as a compassionate filter.
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold font-mono mb-4">Why it is useful</h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-700 font-mono dark:text-zinc-300">
                <li>
                  <strong>Aggregated Sources.</strong> We pull from trusted engineering blogs, changelogs, and verified tech news outlets.
                </li>
                <li>
                  <strong>Respectful Summaries.</strong> Short, LLM-generated summaries let you scan quickly. If it looks interesting, you click through to the original author.
                </li>
                <li>
                  <strong>Credit where it's due.</strong> We always link back. We are a signpost, not a destination.
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold font-mono mb-4">System Design & Architecture</h2>
              <p className="text-zinc-700 font-mono dark:text-zinc-300 mb-4">
                We believe boring software is good software. Our architecture reflects that:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-700 font-mono dark:text-zinc-300">
                <li>
                  <strong>Background Ingestion.</strong> Data is fetched via cron jobs, not on the client. Your browser shouldn't do our heavy lifting.
                </li>
                <li>
                  <strong>Parallel Processing.</strong> We fetch from multiple APIs concurrently to keep our data fresh without latency penalties.
                </li>
                <li>
                  <strong>Deduplication.</strong> Smart logic prevents you from seeing the same press release 15 times.
                </li>
                <li>
                  <strong>Ethical Aggregation.</strong> We store metadata, not full content. We respect the open web.
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold font-mono mb-4">Who it’s built for</h2>
              <p className="text-zinc-700 font-mono dark:text-zinc-300">
                Developers, software engineers, and anyone who appreciates systems that just work. 
                If you care about clean architecture, minimal design, and high signal-to-noise ratios, you're in the right place.
              </p>
            </section>

             <section>
              <h2 className="text-2xl font-bold font-mono mb-4">The Meaning of "Boring"</h2>
              <p className="text-zinc-700 font-mono dark:text-zinc-300 italic border-l-4 border-blue-500 pl-4 py-1 bg-blue-50 dark:bg-blue-900/10 rounded-r-lg">
                "Boring software is software that works. It is predictable, stable, and reliable. 
                It doesn't try to surprise you; it tries to serve you."
              </p>
            </section>
          </article>
        </main>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
           <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
             <p>© {new Date().getFullYear()} The Boring Project. Engineered to be dull.</p>
           </div>
        </footer>
      </div>
    </div>
  );
}
