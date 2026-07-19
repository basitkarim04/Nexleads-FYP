// import { motion } from "framer-motion";
// import { useInView } from "react-intersection-observer";
// import handshake from "../../assets/Images/handshake.png";

// export default function Contact() {
//   const { ref, inView } = useInView({
//     triggerOnce: false,
//     threshold: 0.2,
//   });

//   return (
//     <section
//       id="contact"
//       ref={ref}
//       className="py-20 px-5 md:px-10 text-white"
//     >
//       <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">

//         {/* LEFT SIDE */}
//         <motion.div
//           initial={{ opacity: 0, x: -50 }}
//           animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
//           transition={{ duration: 0.7, ease: "easeOut" }}
//           className="md:pl-4"
//         >
//           <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
//             Let’s scale your <br /> journey together
//           </h2>

//           <motion.img
//             src={handshake}
//             alt="Handshake"
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
//             transition={{ duration: 0.8, delay: 0.3 }}
//             className="w-full max-w-[500px] -mt-10 md:-mt-24"
//           />

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
//             transition={{ duration: 0.6, delay: 0.5 }}
//             className="mt-6"
//           >
//             <p className="font-bold mb-3">Follow Us</p>

//           <div className="flex gap-4 text-3xl">
//   <a href="#" className="hover:scale-110 transition-transform">
//     <i className="ri-linkedin-fill !text-white"></i>
//   </a>
//   <a href="#" className="hover:scale-110 transition-transform">
//     <i className="ri-github-fill !text-white"></i>
//   </a>
//   <a href="#" className="ri-facebook-fill !text-white hover:scale-110 transition-transform"></a>
//   <a href="#" className="hover:scale-110 transition-transform">
//     <i className="ri-instagram-fill !text-white"></i>
//   </a>
//   <a href="#" className="hover:scale-110 transition-transform">
//     <i className="ri-twitter-x-fill !text-white"></i>
//   </a>
// </div>

//           </motion.div>
//         </motion.div>

//         {/* RIGHT SIDE (FORM) */}
//         <motion.div
//           initial={{ opacity: 0, x: 50 }}
//           animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
//           transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
//           className="bg-[#021024b4] p-6 md:p-8 rounded-2xl w-full md:w-[90%] md:ml-10"
//         >
//           {/* Row 1 */}
//           <div className="flex flex-col md:flex-row gap-4 mb-5">
//             <div className="flex-1 flex flex-col">
//               <label className="text-sm font-bold mb-2">Name</label>
//               <input
//                 type="text"
//                 placeholder="John Doe"
//                 className="p-3 bg-white text-black rounded-md text-sm"
//               />
//             </div>

//             <div className="flex-1 flex flex-col">
//               <label className="text-sm font-bold mb-2">Email</label>
//               <input
//                 type="email"
//                 placeholder="example@nexleads.com"
//                 className="p-3 bg-white text-black rounded-md text-sm"
//               />
//             </div>
//           </div>

//           {/* Row 2 */}
//           <div className="flex flex-col md:flex-row gap-4 mb-5">
//             <div className="flex-1 flex flex-col">
//               <label className="text-sm font-bold mb-2">Phone</label>
//               <input
//                 type="text"
//                 placeholder="+123 - 456 - 789"
//                 className="p-3 bg-white text-black rounded-md text-sm"
//               />
//             </div>

//             <div className="flex-1 flex flex-col">
//               <label className="text-sm font-bold mb-2">Subject</label>
//               <input
//                 type="text"
//                 placeholder="Ex Leads"
//                 className="p-3 bg-white text-black rounded-md text-sm"
//               />
//             </div>
//           </div>

//           {/* Message */}
//           <div className="flex flex-col mb-6">
//             <label className="text-sm font-bold mb-2">Message</label>
//             <textarea
//               placeholder="Type your message here..."
//               className="p-3 bg-white text-black rounded-md text-sm h-32 resize-none"
//             />
//           </div>

//           <motion.button
//             type="submit"
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
//             transition={{ duration: 0.5, delay: 0.6 }}
//             className="
//               w-full md:w-2/5
//               bg-[#8eaee0]
//               hover:bg-[#7DA0CA]
//               text-white
//               py-3
//               rounded-md
//               text-sm
//               font-bold
//               transition
//             "
//           >
//             Send Message
//           </motion.button>
//         </motion.div>

//       </div>
//     </section>
//   );
// }



// Contact.jsx
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import handshake from "../../assets/Images/handshake.png";
import { baseurl } from "../../BaseUrl";

export default function Contact() {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${baseurl}/user/submit-contact-form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: data.message || "Message sent successfully!",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="px-5 md:px-10 text-white"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="md:pl-4"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Let's scale your <br /> journey together
          </h2>

          <motion.img
            src={handshake}
            alt="Handshake"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-[500px] -mt-10 md:-mt-24"

          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6"
          >
            <p className="font-bold mb-3">Follow Us</p>

            <div className="flex gap-4 text-3xl">
              <a href="#" className="hover:scale-110 transition-transform">
                <i className="ri-linkedin-fill !text-white"></i>
              </a>
              <a href="#" className="hover:scale-110 transition-transform">
                <i className="ri-github-fill !text-white"></i>
              </a>
              <a href="#" className="ri-facebook-fill !text-white hover:scale-110 transition-transform"></a>
              <a href="#" className="hover:scale-110 transition-transform">
                <i className="ri-instagram-fill !text-white"></i>
              </a>
              <a href="#" className="hover:scale-110 transition-transform">
                <i className="ri-twitter-x-fill !text-white"></i>
              </a>
            </div>
          </motion.div>
        </motion.div>
        {/* RIGHT SIDE (FORM) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
          className="bg-[#021024b4] p-6 md:p-8 rounded-2xl w-full md:w-[100%] md:ml-10"
        >
          <form onSubmit={handleSubmit}>
            {/* Status Message */}
            {status.message && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  status.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {status.message}
              </div>
            )}

            {/* Row 1 */}
            <div className="flex flex-col md:flex-row gap-4 mb-5">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-bold mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="p-3 bg-white text-black rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8eaee0]"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-sm font-bold mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@nexleads.com"
                  required
                  className="p-3 bg-white text-black rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8eaee0]"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col md:flex-row gap-4 mb-5">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-bold mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+123 - 456 - 789"
                  required
                  className="p-3 bg-white text-black rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8eaee0]"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-sm font-bold mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Ex Leads"
                  required
                  className="p-3 bg-white text-black rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8eaee0]"
                />
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col mb-6">
              <label className="text-sm font-bold mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message here..."
                required
                rows="5"
                className="p-3 bg-white text-black rounded-md text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#8eaee0]"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className={`
                w-full md:w-2/5
                bg-[#8eaee0]
                hover:bg-[#7DA0CA]
                text-white
                py-3
                rounded-md
                text-sm
                font-bold
                transition
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {loading ? "Sending..." : "Send Message"}
            </motion.button>
          </form>
        </motion.div>

      </div>
    </section>
  );
}