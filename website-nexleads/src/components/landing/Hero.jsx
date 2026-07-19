// src/components/Hero.jsx
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import hero_img from "../../assets/Images/hero_img.png";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [scrollDir, setScrollDir] = useState("up");   // default = up
  const [didScroll, setDidScroll] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      if (Math.abs(y - lastY) < 3) return; // ignore tiny jitter

      if (y > lastY) {
        setScrollDir("down");
      } else if (y < lastY) {
        setScrollDir("up");
      }

      setDidScroll(true);
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="home" className="hero">
      {/* Text */}
      <motion.div
        ref={ref}
        className="hero__content"
        initial={{ opacity: 0, y: -50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1>
          Find. Connect. Convert.<br />
          <span className="accent">Smarter, Faster, Easier.</span>
        </h1>

        <p className="lead">
          NexLeads helps you discover potential clients on social media,
          extract their contact details, and send personalized outreach, all in one platform
        </p>

<div className="flex items-center justify-center md:justify-start mt-5 sm:mt-5">
  <button
  onClick={() => {navigate('/login')}}
    className="
      border border-white
      text-white
      bg-transparent
      rounded-full
      px-5 py-3
      font-bold
      tracking-wide
      transition
      hover:bg-white hover:text-black
      w-full sm:w-auto
      sm:mr-10 
    "
  >
    Get Started
  </button>
</div>


      </motion.div>

      {/* Image */}
      <div className="hero__art">
        <motion.img
          src={hero_img}
          alt="Lead magnet illustration"
          // up = 0deg (normal), down = -90deg (rotate left)
          animate={{ rotate: scrollDir === "down" ? -90 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`magnet ${didScroll ? "" : "magnet-onload"} w-[300px] mx-auto`}
        />
      </div>
    </section>
  );
}









