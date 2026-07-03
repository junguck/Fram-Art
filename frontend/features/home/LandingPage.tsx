import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Palette, Sparkles, Globe } from 'lucide-react';

const slides = [
  {
    title: 'Galerie immersive',
    description: "Montrez vos œuvres avec une mise en page moderne et inspirante.",
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Communauté créative',
    description: "Suivez des artistes, découvrez des talents et échangez en direct.",
    image: 'https://images.unsplash.com/photo-1496317556649-f930d733eea5?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Publication facile',
    description: "Importez vos œuvres, gérez vos favoris et recevez des notifications instantanées.",
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
  },
];

const featureItems = [
  {
    icon: <Palette size={24} className="text-violet-400" />, 
    title: 'Vitrine artistique',
    text: 'Publiez et partagez vos créations avec un design taillé pour l’art contemporain.',
  },
  {
    icon: <Sparkles size={24} className="text-cyan-400" />,
    title: 'Expérience fluide',
    text: 'Navigation rapide, animations stylées et écrans clairs pour les artistes et visiteurs.',
  },
  {
    icon: <Heart size={24} className="text-pink-400" />,
    title: 'Favoris & interactions',
    text: 'Gardez vos œuvres coup de cœur, commentez et suivez les nouveaux talents.',
  },
  {
    icon: <Globe size={24} className="text-amber-400" />,
    title: 'Accessibilité web',
    text: 'Un accueil percutant sans connexion backend pour présenter la plateforme rapidement.',
  },
];

const LandingPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 overflow-hidden">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),transparent_26%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.14),transparent_22%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)]" />
        <div className="absolute -left-24 top-20 h-52 w-52 rounded-full bg-cyan-300/30 blur-3xl floating-soft" />
        <div className="absolute right-0 top-12 h-44 w-44 rounded-full bg-pink-300/25 blur-3xl floating-soft-fast" />
        <div className="absolute left-1/2 bottom-24 h-60 w-60 -translate-x-1/2 rounded-full bg-violet-300/25 blur-3xl floating-tilt" />
        <div className="relative mx-auto min-h-screen max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                Frame'Art — Plateforme d’art en ligne
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-700">
              <Link
                to="/login"
                className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-200/40 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Se connecter
              </Link>
            </div>
          </header>

          <section className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl space-y-8">
              <p className="inline-flex rounded-full border border-cyan-200/70 bg-cyan-100/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-700 shadow-sm">
                Création • Exposition • Communauté
              </p>
              <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                Donnez vie à votre art avec une galerie numérique lumineuse et fluide.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                Frame'Art réunit artistes, collectionneurs et passionnés autour d’une expérience claire, moderne et inspirante — sans compromis sur le style.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] transition hover:-translate-y-1"
                >
                  Commencer maintenant
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#features"
                  className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Voir les fonctionnalités
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-3xl border border-slate-200/70 bg-white p-4 text-center shadow-sm">
                  <p className="text-3xl font-black text-cyan-600">+100</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">Artistes</p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-white p-4 text-center shadow-sm">
                  <p className="text-3xl font-black text-rose-500">24/7</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">Exploration</p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-white p-4 text-center shadow-sm">
                  <p className="text-3xl font-black text-amber-500">Favoris</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">Collections</p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-white p-4 text-center shadow-sm">
                  <p className="text-3xl font-black text-violet-500">Rapide</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">Navigation</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-0 bottom-0 h-64 rounded-full bg-cyan-200/30 blur-3xl" />
              <div className="relative mx-auto w-full max-w-xl">
                <div className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full bg-pink-200/30 blur-3xl floating-soft" />
                <div className="pointer-events-none absolute -right-10 bottom-12 h-36 w-36 rounded-full bg-cyan-200/25 blur-3xl floating-soft-fast" />
                <div style={{ perspective: 1200 }} className="relative">
                  <div className="space-y-6">
                    {slides.map((slide, index) => (
                      <article
                        key={slide.title}
                        className={`group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_40px_120px_-45px_rgba(15,23,42,0.15)] transition-transform duration-700 ease-out ${
                          index === 0 ? 'translate-y-0' : index === 1 ? '-translate-y-4' : '-translate-y-8'
                        } hover:-translate-y-2 hover:shadow-[0_40px_120px_-35px_rgba(15,23,42,0.18)]`}
                      >
                        <div className="overflow-hidden rounded-[1.75rem] bg-slate-100">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="h-64 w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-6">
                          <p className="text-xs uppercase tracking-[0.3em] text-cyan-500">Visuel libre de droits</p>
                          <h2 className="mt-4 text-xl font-black text-slate-950">{slide.title}</h2>
                          <p className="mt-3 text-sm leading-6 text-slate-600">{slide.description}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="mt-24 rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.08)] p-8">
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Fonctionnalités</p>
              <h2 className="text-3xl font-black text-slate-950">Tout ce dont votre plateforme d’art a besoin</h2>
              <p className="max-w-2xl text-slate-600">
                Une landing page épurée et moderne inspirée des meilleurs sites produits, avec un accès direct au login sans dépendre du backend.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featureItems.map((feature) => (
                <div key={feature.title} className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 grid gap-8 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/90 p-8 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.15)] backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Commencer</p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">Rejoignez Frame'Art maintenant</h3>
              <p className="mt-4 text-slate-600">Accédez à votre espace, publiez vos œuvres, gérez vos favoris et suivez une communauté créative immédiatement.</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1"
                >
                  Se connecter
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/90 p-8 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.15)] backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Design</p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">Animations 3D et visuels premium</h3>
              <p className="mt-4 text-slate-600">Une expérience d’accueil inspirée par les grandes pages de produits, avec des effets de mouvement, des cartes flottantes et des visuels authentiques.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LandingPage;
