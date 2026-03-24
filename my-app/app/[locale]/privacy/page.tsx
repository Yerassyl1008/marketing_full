import Footer from "../../components/footer/footer";
import Header from "../../components/headaer/header";
import PrivacyContent from "../../components/privacy/privacy-content";
import Confidentel from "../../components2/confidental/confidental";
import { TeamSurfaceHeaderSection } from "@/app/components/layout/team-surface-header";

export default function Privacy() {
  return (
    <>
    
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-3 sm:gap-8 sm:px-4 md:px-6 lg:max-w-[1400px]">
      <TeamSurfaceHeaderSection className="mt-3">
        <Header />
        <Confidentel />
      </TeamSurfaceHeaderSection>
      <PrivacyContent />
    </div>
      <Footer />
    </>

  );
}