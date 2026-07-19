import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import HIW from "../../assets/Images/HIW.png";


const steps = [
  {
    number: "01 ",
    title: " Search Your Keywords",
    description:
      " Type phrases like 'Looking for a website developer' and NexLeads scans social platforms for matching posts.",
  },
  {
    number: "02",
    title: "Get Contact Info",
    description:
      "Automatically extract names, emails, and details of potential clients.",
  },
  {
    number: "03",
    title: "Outreach & Convert",
    description:
      "Send a friendly email or message directly from your dashboard and close the deal.",
  },
];

const HowItWorks = () => {
  const { ref, inView } = useInView({
    triggerOnce: false, // 👈 animate every time section visible
    threshold: 0.2,
  });

  return (
    <div className="how-it-works mt-10" id="how-It-Works" ref={ref}>
      <div className="text-section">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          How it Works
        </motion.h2>

        <motion.span
          className="subtitle"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          Three Simple Steps to Grow Your Clients
        </motion.span>

        <br /> <br />

        {/* Steps */}
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="step"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: 0.3 + index * 0.3, // staggered
            }}
          >
            <h3>
              <span className="number">{step.number}</span>
            </h3>
            <div className="innerdiv">
              <h3>{step.title}</h3>
              <span>{step.description}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Image Section */}
      <motion.div
        className="image-section mt-5 sm:mt-5"
        initial={{ opacity: 0, x: 60 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
      >
        <img src={HIW} alt="VR person" />
      </motion.div>
    </div>
  );
};

export default HowItWorks;
