// import { motion } from "framer-motion";
// import { useInView } from "react-intersection-observer";
// import feature1 from "../../assets/Images/feature1.png";
// import feature2 from "../../assets/Images/feature2.png";
// import feature3 from "../../assets/Images/feature3.png";

// const features = [
//   {
//     title: "AI-Powered Lead Search",
//     description:
//       "Search social platforms using keywords to instantly find people looking for your services.",
//     image: feature1,
//     tag: "Searching",
//   },
//   {
//     title: "Built-in Email Outreach",
//     description:
//       "Send bulk / personalized emails directly from your dashboard and track responses in real-time.",
//     image: feature2,
//     tag: "Emailing",
//   },
//   {
//     title: "Follow Up Tracking",
//     description:
//       "Stay organized with automatic reminders and status updates for every lead you contact.",
//     image: feature3,
//     tag: "Follow - Ups",
//   },
// ];

// export default function Features() {
//   const { ref, inView } = useInView({
//     triggerOnce: false, // 👈 run every time visible
//     threshold: 0.2,
//   });

//   return (
//     <section id="features" className="features" ref={ref}>
//       <div className="features__container">
//         {/* Heading */}
//         <motion.h2
//           initial={{ opacity: 0, y: -30 }}
//           animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
//           transition={{ duration: 0.6, ease: "easeOut" }}
//           className="features__title"
//         >
//           Features
//         </motion.h2>

//         <motion.p
//           initial={{ opacity: 0, y: -20 }}
//           animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
//           transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
//           className="features__subtitle"
//         >
//           Everything You Need for Smart Lead Generation
//         </motion.p>

//         {/* Grid */}
//         <div className="features__grid">
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: -40 }}
//               animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -40 }}
//               transition={{
//                 duration: 0.6,
//                 ease: "easeOut",
//                 delay: index * 0.2,
//               }}
//               className="feature__card"
//             >
//               <div className="feature__image">
//                 <img src={feature.image} alt={feature.title} />
//               </div>
//               <h3 className="mt-5 mb-6 feature__title">{feature.title}</h3>
//               <p className="feature__desc mb-5">{feature.description}</p>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }






















import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import feature1 from "../../assets/Images/feature1.png";
import feature2 from "../../assets/Images/feature2.png";
import feature3 from "../../assets/Images/feature3.png";

const features = [
  {
    title: "AI-Powered Lead Search",
    description:
      "Search social platforms using keywords to instantly find people looking for your services.",
    image: feature1,
  },
  {
    title: "Built-in Email Outreach",
    description:
      "Send bulk / personalized emails directly from your dashboard and track responses in real-time.",
    image: feature2,
  },
  {
    title: "Follow Up Tracking",
    description:
      "Stay organized with automatic reminders and status updates for every lead you contact.",
    image: feature3,
  },
];

export default function Features() {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  return (
    <section
      id="features"
      ref={ref}
      className="
        py-20
        px-6
        md:px-12
        lg:px-20
        text-center
        text-white
      "
    >
      <div className="max-w-7xl mx-auto mt-10">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="
            text-3xl
            md:text-4xl
            font-extrabold
          "
        >
          Features
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="
            text-[#C1E8FF]
            text-base
            md:text-lg
            mt-3
            mb-12
          "
        >
          Everything You Need for Smart Lead Generation
        </motion.p>

        {/* Grid */}
        <div
          className="
            grid
            gap-8
            sm:grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            justify-items-center
          "
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -40 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -40 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: index * 0.2,
              }}
              className="
                bg-white
                text-[#111]
                rounded-[35px]
                p-4
                shadow-[0px_8px_20px_rgba(0,0,0,0.2)]
                transition-transform
                duration-300
                hover:-translate-y-2
                w-full
                max-w-[350px]
              "
            >
              <div className="overflow-hidden rounded-[25px]">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="
                    w-full
                    h-[150px]
                    object-cover
                    sm:h-[220px]
                  "
                />
              </div>

              <h3 className="mt-6 mb-4 text-xl font-bold text-center leading-tight">
                {feature.title}
              </h3>

              <p className="text-sm text-[#222E3F] text-center leading-snug">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

