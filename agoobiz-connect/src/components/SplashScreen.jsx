import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import "../styles/splash.css";

export default function SplashScreen({ onFinish }) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHiding(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`splash-screen ${hiding ? "splash-hide" : ""}`}
      onAnimationEnd={() => hiding && onFinish()}
    >
      <div className="splash-content">
        <img src={logo} alt="AgooBiz Connect" className="splash-logo" />
        <h1 className="splash-title">
          <span className="splash-agoo">AgooBiz</span>{" "}
          <span className="splash-connect">Connect</span>
        </h1>
        <p className="splash-tagline">Occasion food from Agoo's home kitchens</p>
        <div className="splash-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
}