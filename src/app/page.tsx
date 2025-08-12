import LightRays from "./components/LightRayes";
import SplashCursor from "./components/SplashCursor";
import TunnelExperience from "./components/TunnelExperience";

export default function Home() {
  return (
    < >
      <div style={{ width: '100%', height: '100vh', position: 'relative' ,zIndex:0, pointerEvents: 'none',}}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#FF66CC" 
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
      <SplashCursor />
      <TunnelExperience />
    </>
  );
}
