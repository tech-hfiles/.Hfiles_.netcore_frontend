// All components are in the LandingPage folder
import ScriptLoader from './components/LandingPage/ScriptLoader';
import HowItWorks from './components/LandingPage/HowItWorks';
import Header from './components/LandingPage/Header';
import Hero from './components/LandingPage/Hero';
import WhyUse from './components/LandingPage/WhyUse';
import AbhaCard from './components/LandingPage/AbhaCard';
import AbhaIdSignup from './components/LandingPage/AbhaIdSignup';
import PersonalizedSolutions from './components/LandingPage/PersonalizedSolutions';
import AboutUs from './components/LandingPage/AboutUs';
import Recognized from './components/LandingPage/Recognized';
import Testimonials from './components/LandingPage/Testimonials';
import Articles from './components/LandingPage/Articles';
import TalkToUs from './components/LandingPage/TalkToUs';
import HandshakeSection from './components/LandingPage/HandshakeSection';
import Footer from './components/LandingPage/Footer';
import "./styles/index4.css";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <WhyUse />
      <HowItWorks />
      <AbhaCard />
      <AbhaIdSignup />
      <PersonalizedSolutions />
      <AboutUs />
      <Recognized />
      <Testimonials />
      <Articles />
      <TalkToUs />
      <HandshakeSection />
      <Footer />
      <ScriptLoader />
    </>
  );
}