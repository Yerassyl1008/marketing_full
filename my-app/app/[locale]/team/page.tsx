import Header from "../../components/headaer/header";
import Design from "../../components2/design/design";
import Features from "../../components2/feature/features";
import Info from "../../components2/info/info";
import Card from "../../components/card/card";
import Faq from "../../components2/faq/faq";   
import Footer from "../../components/footer/footer";
import { TeamSurfaceHeaderSection } from "@/app/components/layout/team-surface-header";

export default function Team() {
  return (
    <>
    <main className="mx-auto flex w-full min-w-0 max-w-[1280px] flex-col gap-8 px-3 sm:gap-10 sm:px-4 md:px-6 lg:max-w-[1400px]">
      <TeamSurfaceHeaderSection className="mt-6">
        <Header />
        <Design />
      </TeamSurfaceHeaderSection>
      <Features />
      <Info />
        <Card />
      <Faq />
    </main>
      <Footer />
      </>
  );
}