import { useCallback, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import EjectIntro from "./components/EjectIntro";
import ScrollProgress from "./components/ScrollProgress";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Ticker from "./components/Ticker";
import AboutSection from "./components/AboutSection";
import HowItWorks from "./components/HowItWorks";
import Roles from "./components/Roles";
import Maps from "./components/Maps";
import EmergencyMeeting from "./components/EmergencyMeeting";
import EventDetails from "./components/EventDetails";
import EventSchedule from "./components/EventSchedule";
import Rules from "./components/Rules";
import RegistrationCTA from "./components/RegistrationCTA";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function App() {
  const [ready, setReady] = useState(false);
  const onLoaded = useCallback(() => setReady(true), []);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{!ready && <EjectIntro key="intro" onDone={onLoaded} />}</AnimatePresence>
      <ScrollProgress />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero ready={ready} />
        <Ticker />
        <AboutSection />
        <HowItWorks />
        <Roles />
        <Maps />
        <EmergencyMeeting />
        <EventDetails />
        <EventSchedule />
        <Rules />
        <RegistrationCTA />
        <FAQ />
      </main>
      <Footer />
    </MotionConfig>
  );
}
