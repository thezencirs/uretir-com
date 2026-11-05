import { GalaxyIntro } from "@/components/galaxy-intro";
import { getPublishedContent } from "@/lib/site-content-store";

export default async function HomePage() {
  const content = await getPublishedContent();
  return (
    <div className="home-galaxy-only">
      <h1 className="sr-only">
        {content.home.title} — {content.home.description}
      </h1>
      <GalaxyIntro />
    </div>
  );
}
