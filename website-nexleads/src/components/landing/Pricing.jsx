import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Pricing() {
  const [billing, setBilling] = useState("monthly");

  const plans = [
    {
      name: "Free",
      price: billing === "monthly" ? 0 : 0,
      description: "Basic Pricing Plan",
      button: "Sign Up Now",
      features: ["30 leads/month", "Basic email templates", "Limited follow-up tracking"],
      color: "#021024", // blue
    },
    {
      name: "Pro",
      price: billing === "monthly" ? 29 : 296, // annual = save ~15%
      description: "Advanced tools for Growing",
      button: "Start Free Trial",
      features: ["100 leads/month", "Custom email sequences", "Advanced analytics"],
      color: "#052659", // purple
    },
    {
      name: "Platinum",
      price: billing === "monthly" ? 99 : 1010,
      description: "Complete Collaboration of tools",
      button: "Start Free Trial",
      features: ["Unlimited leads","API access", "Team collaboration"],
      color: "#021024", // green
    },
  ];

  const { ref, inView } = useInView({
    triggerOnce: false, // 👈 animate every time visible
    threshold: 0.2,
  });

  return (
    <section className="pricing" id="pricing" ref={ref}>
      <div className="pricing__container">
        {/* Heading */}
        <motion.h2
          className="pricing__title"
          initial={{ opacity: 0, y: -30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Choose the Perfect<br />Plan for your Business
        </motion.h2>

        <motion.p
          className="pricing__subtitle"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          Flexible Plans for Every Business
        </motion.p>

{/* Billing Toggle */}
<motion.div
  initial={{ opacity: 0, y: -15 }}
  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -15 }}
  transition={{ duration: 0.6, delay: 0.4 }}
  className="
    flex flex-col
    sm:inline-flex sm:flex-row
    items-stretch sm:items-center
    gap-2
    bg-[#C1E8FF]
    rounded-2xl sm:rounded-full
    p-2 sm:p-1
    mb-12
    w-full sm:w-auto
    max-w-sm sm:max-w-none
    mx-auto
  "
>
  {/* Monthly */}
  <label
    className={`flex items-center justify-center gap-2
      w-full sm:w-auto
      px-4 py-2
      rounded-xl sm:rounded-full
      cursor-pointer
      transition
      ${
        billing === "monthly"
          ? "bg-white text-black"
          : "text-black/80"
      }`}
  >
    <input
      type="radio"
      name="billing"
      value="monthly"
      checked={billing === "monthly"}
      onChange={() => setBilling("monthly")}
      className="accent-[#052659] w-4 h-4"
    />
    <span className="text-sm font-medium">Monthly</span>
  </label>

  {/* Annually */}
  <label
    className={`flex items-center justify-center gap-2
      w-full sm:w-auto
      px-4 py-2
      rounded-xl sm:rounded-full
      cursor-pointer
      transition
      ${
        billing === "annually"
          ? "bg-white text-black"
          : "text-black/80"
      }`}
  >
    <input
      type="radio"
      name="billing"
      value="annually"
      checked={billing === "annually"}
      onChange={() => setBilling("annually")}
      className="accent-[#052659] w-4 h-4"
    />
    <span className="text-sm font-medium">
      Annually
      <span className="ml-1 text-xs text-[#2C2C2C]">
        Save 15%
      </span>
    </span>
  </label>
</motion.div>



        {/* Cards */}
        <div className="pricing__grid">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className="pricing__card"
              style={{ backgroundColor: plan.color, color: "white" }}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: 0.5 + i * 0.2, // stagger effect
              }}
            >
              <h3>{plan.name}</h3>
              <p className="price">
                ${plan.price}
                <span>/mo</span>
              </p>
              <p className="desc">{plan.description}</p>
              <button className="pricing__btn">{plan.button}</button>
              <p className="billed">
                Billed {billing === "monthly" ? "Monthly" : "Annually"}
              </p>
              <hr />
              <ul className="feature">
                {plan.features.map((f, j) => (
                  <li key={j}>✔ {f}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
