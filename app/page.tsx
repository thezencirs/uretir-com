import { GalaxyIntro } from "@/components/galaxy-intro";
import { HomeCommandHub } from "@/components/home-command-hub";

export default function HomePage() {
  return (
    <div className="home-galaxy-shell">
      <GalaxyIntro />
      <HomeCommandHub />
    </div>
  );
}
