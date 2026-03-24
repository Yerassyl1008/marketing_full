import Header from "../../components/headaer/header";
import Card from "../../components/card/card";
import Footer from "../../components/footer/footer";
import { TeamSurfaceHeaderSection } from "@/app/components/layout/team-surface-header";

export default function SiteMapPage() {
  return (
    <>  
    <main className="mx-auto flex w-full min-w-0 max-w-[1280px] flex-col gap-6 px-3 sm:gap-8 sm:px-4 md:px-6 lg:max-w-[1400px]">
      <TeamSurfaceHeaderSection
        className="mt-4"
        innerClassName="flex flex-col gap-14 !pb-6 md:!pb-8"
      >
        <Header matchTeamSurface />
        <Card embedded />
      </TeamSurfaceHeaderSection>
    </main>
      <Footer />
    </>

  );
}

