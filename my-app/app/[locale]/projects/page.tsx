import Footer from "../../components/footer/footer";
import Header from "../../components/headaer/header";
import Features from "../../components2/feature/features";
import Sales from "../../components2/sales/sales";
import Gallery from "../../components2/gallery/gallery";
import Info from "../../components2/info/info";
import Comment from "../../components/comment/comment";
import Faq from "../../components2/faq/faq";
import { TeamSurfaceHeaderSection } from "@/app/components/layout/team-surface-header";

export default function ProjectsPage() {
  return (
    <>
    
    
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-3 sm:gap-8 sm:px-4 md:px-6 lg:max-w-[1400px]">
      <TeamSurfaceHeaderSection className="mt-4">
        <Header />
        <Sales />
      </TeamSurfaceHeaderSection>
      <Features />
      
      <Gallery />
      <Info />
      <Comment />
      <Faq />
    </main>
      <Footer />
    </>

  );
}
