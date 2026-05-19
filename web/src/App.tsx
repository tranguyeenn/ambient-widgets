import AnimatedFavicon from "./components/AnimatedFavicon";
import OrbitalBackground from "./components/OrbitalBackground";
import SiteNav from "./components/SiteNav";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Features from "./components/Features";
import InteractiveDemo from "./components/InteractiveDemo";
import TechnicalDecisions from "./components/TechnicalDecisions";
import LessonsLearned from "./components/LessonsLearned";
import FinalCTA from "./components/FinalCTA";

export default function App() {
  return (
    <>
      <AnimatedFavicon />
      <OrbitalBackground />
      <SiteNav />
      <main>
        <Hero />
        <Problem />
        <Features />
        <InteractiveDemo />
        <TechnicalDecisions />
        <LessonsLearned />
        <FinalCTA />
      </main>
    </>
  );
}
