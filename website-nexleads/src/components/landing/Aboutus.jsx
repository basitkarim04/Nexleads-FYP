import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import mohsin from "../../assets/Images/mohsin.jpg";
import anas from "../../assets/Images/anas.jpg";
import basit from "../../assets/Images/basitPic.png";
import sohaib from "../../assets/Images/sohaib.jpg";
import linkedin from "../../assets/Images/linkedin.png";
import github from "../../assets/Images/github.png";

const team = [
  {
    name: "Mohsin Salman",
    img: mohsin,
    linkedin: "#",
    github: "#",
  },
  {
    name: "Syed Anas Rehan",
    img: anas,
    linkedin: "#",
    github: "#",
  },
  {
    name: "M. Sohaib Kamran",
    img: sohaib,
    linkedin: "#",
    github: "#",
  },
  {
    name: "Basit Karim",
    img: basit,
    linkedin: "#",
    github: "#",
  },
];

const AboutUs = () => {
  const { ref, inView } = useInView({
    triggerOnce: false, // 👈 will animate again if scrolled back
    threshold: 0.2,
  });

  return (
    <div className="about-us" id="about-Us" ref={ref}>
      <div className="left-section">
        <motion.p
          className="small-title"
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.6 }}
        >
          About Us
        </motion.p>

        <motion.hr
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Why We Built NexLeads
        </motion.h2>

        <motion.p
          className="description"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          We understand how time-consuming and frustrating it can be to find
          clients manually. That’s why we built NexLeads — a simple yet powerful
          tool that automates lead discovery and outreach, so you can focus on
          what matters most: closing deals.
        </motion.p>

        <div className="stats">
          {["5.03k", "2k+", "10k+", "95%"].map((stat, i) => (
            <motion.div
              key={i}
              className="stat"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.2 }}
            >
              <p>
                {i === 0 && "New Users ."}
                {i === 1 && "Projects Delivered ."}
                {i === 2 && "Total Users ."}
                {i === 3 && "Client Satisfaction ."}
              </p>
              <hr />
              <h3>{stat}</h3>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="right-section">
        {team.map((member, index) => (
          <motion.div
            key={index}
            className="card"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.5 + index * 0.2 }}
          >
            <img src={member.img} alt={member.name} />
            <div className="card-info">
              <p>{member.name}</p>
              <div className="icons">
                <a href={member.linkedin}>
                  <img src={linkedin} alt="LinkedIn" />
                </a>
                <a href={member.github}>
                  <img src={github} alt="GitHub" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
