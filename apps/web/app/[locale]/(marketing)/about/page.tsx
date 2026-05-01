import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About",
    description: "Where techno meets art — the story of ELBTRONIKA",
  };
}

export default async function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#00f5d4]/[0.03] blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Our</span> <span className="gradient-text">Vision</span>
          </h1>
          <p className="text-lg text-white/50 leading-relaxed">
            ELBTRONIKA was born in the underground clubs of Berlin, where flashing strobes
            illuminated oil paintings hung above the DJ booth. We believe electronic music and
            digital art share the same pulse — rhythm, emotion, and transcendence.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-white">Music</span> <span className="gradient-text">× Art</span>
            </h2>
            <p className="text-white/40 leading-relaxed mb-4">
              We curate immersive gallery experiences where each room is paired with a unique DJ
              set. Our AI-powered matching engine analyzes audio features and artwork metadata to
              create synesthetic experiences.
            </p>
            <p className="text-white/40 leading-relaxed">
              For artists, we offer fair revenue splits, direct sales, and a global audience of
              electronic music enthusiasts. For collectors, we provide limited-edition pieces that
              resonate with the culture.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Artists", value: "50+" },
              { label: "Artworks", value: "200+" },
              { label: "Countries", value: "15" },
              { label: "Genres", value: "Techno, House, Ambient" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-xl glass border border-white/[0.06] text-center"
              >
                <div className="text-2xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">
            <span className="text-white">Core</span> <span className="gradient-text">Values</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Fairness",
                desc: "Artists keep the majority of every sale. Transparent revenue splits, always.",
              },
              {
                title: "Innovation",
                desc: "AI-powered curation, immersive 3D galleries, spatial audio experiences.",
              },
              {
                title: "Community",
                desc: "Built by artists, for artists. A global network of creators and collectors.",
              },
            ].map((v) => (
              <div key={v.title} className="p-8 rounded-2xl glass border border-white/[0.06]">
                <h3 className="text-xl font-semibold text-white mb-3">{v.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
