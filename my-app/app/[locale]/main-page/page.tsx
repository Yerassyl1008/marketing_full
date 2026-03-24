import Header from "../../components/headaer/header";
import Hero from "../../components/hero/hero";
import Workers from "../../components/workers/workers";
import Services from "../../components/services/services";
import Card from "../../components/card/card";
// import Work from "../../components/work/work";
import Projects from "../../components/projects/projects";
import Comment from "../../components/comment/comment";
import Footer from "../../components/footer/footer";
import { TeamSurfaceHeaderSection } from "@/app/components/layout/team-surface-header";

export default function MainPage() {
  return (
    <>  
    
    
    <div className="mx-auto flex w-full min-w-0 max-w-[1280px] flex-col gap-6 px-3 sm:gap-8 sm:px-4 md:px-6 lg:max-w-[1400px]">
      <TeamSurfaceHeaderSection className="mt-3">
        <Header />
        <Hero />
      </TeamSurfaceHeaderSection>
      <Workers />
      <Services />
      <Card />
      {/* <Work /> */}
      <Projects />
      <Comment />
    </div>
      <Footer />
    </>

  );
}