import Footer from "../../components/footer/footer";
import Header from "../../components/headaer/header";
import Smm from "../../components2/smm/smm";
import Services from "../../components/services/services";
import Card from "../../components/card/card";
import Faq from "../../components2/faq/faq";
import { TeamSurfaceHeaderSection } from "@/app/components/layout/team-surface-header";

export default function ServicesPage() {
  return (
    <>  
    <main className="mx-auto flex w-full min-w-0 max-w-[1280px] flex-col gap-8 px-3 sm:gap-10 sm:px-4 md:px-6 lg:max-w-[1400px]">
    <TeamSurfaceHeaderSection className="mt-6">
      <Header />
      <Smm />
    </TeamSurfaceHeaderSection>
    <Services />
    <Card />
    <Faq />
    </main>
    <Footer />

    </>

  );
}

