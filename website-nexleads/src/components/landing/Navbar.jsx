// import { useState } from "react";
// import { Menu, X } from "lucide-react";
// import { useActiveSection } from "./useActiveSection";
// import nexLeadlogo from "../../assets/Images/nexLeadLogo.png";
// import { Link } from "react-router-dom";

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);

//   // 👇 Use label + id pairs
//   const navLinks = [
//     { id: "home", label: "Home" },
//     { id: "features", label: "Features" },
//     { id: "how-It-Works", label: "How it Works" },
//     { id: "pricing", label: "Pricing" },
//     { id: "about-Us", label: "About Us" },
//     { id: "contact", label: "Contact" },
//   ];

//   const activeId = useActiveSection(navLinks.map(link => link.id));

//   return (
//     <header className="nav">
//       {/* Brand */}
//       <div className="nav__brand">
//         <Link to="/dashboard">
//           <img src={nexLeadlogo} alt="NexLeads Logo" width="120" />
//         </Link>
//       </div>

//       {/* Links - Desktop */}
//       <nav className="nav__links desktop">
//         {navLinks.map(({ id, label }) => (
//           <a
//             key={id}
//             href={`#${id}`}
//             className={activeId === id ? "active" : ""}
//           >
//             {label}
//           </a>
//         ))}
//       </nav>

//       {/* Actions - Desktop */}
//       <div className="nav__actions desktop">
//         <Link to="/login">
//         <button className="btn btn-outline">Login</button>
//         </Link>
//       </div>

//       {/* Burger Icon - Mobile */}
//       <button className="burger mobile" onClick={() => setIsOpen(!isOpen)}>
//         {isOpen ? <X size={28} /> : <Menu size={28} />}
//       </button>

//       {/* Mobile Menu */}
//       {isOpen && (
//         <nav className="nav__mobile mobile">
//           {navLinks.map(({ id, label }) => (
//             <a
//               key={id}
//               href={`#${id}`}
//               onClick={() => setIsOpen(false)}
//               className={activeId === id ? "active" : ""}
//             >
//               {label}
//             </a>
//           ))}
//           <button className="btn btn-outline">Login</button>
//         </nav>
//       )}
//     </header>
//   );
// }









import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useActiveSection } from "./useActiveSection";
import nexLeadlogo from "../../assets/Images/nexLeadLogo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "how-It-Works", label: "How it Works" },
    { id: "pricing", label: "Pricing" },
    { id: "about-Us", label: "About Us" },
    { id: "contact", label: "Contact" },
  ];

  const activeId = useActiveSection(navLinks.map(link => link.id));

  return (
    <header className="fixed left-0 w-full z-[100000]">
      <div className="max-w-8xl mx-auto flex items-center justify-between px-6 rounded-full">


        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <img
              src={nexLeadlogo}
              alt="NexLeads Logo"
              className="w-[120px]"
            />
          </Link>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-2 bg-white px-2 py-2 rounded-full shadow-sm">
          {navLinks.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200
                ${
                  activeId === id
                    ? "bg-[#C1E8FF] text-[#052659]"
                    : "text-[#052659] hover:bg-[#C1E8FF]"
                }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop Button */}
        <div className="hidden md:flex">
          <Link to="/login">
            <button className="border border-white text-white px-5 py-2 rounded-full font-semibold hover:bg-white hover:text-[#052659] transition">
              Login
            </button>
          </Link>
        </div>

        {/* Mobile Burger */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 mx-4 bg-white rounded-2xl shadow-lg p-5 space-y-3">
          {navLinks.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 rounded-full font-semibold transition
                ${
                  activeId === id
                    ? "bg-[#C1E8FF] text-[#052659]"
                    : "text-[#052659] hover:bg-[#C1E8FF]"
                }`}
            >
              {label}
            </a>
          ))}

          <Link to="/login">
            <button className="w-full border border-[#052659] text-[#052659] py-2 rounded-full font-semibold mt-2">
              Login
            </button>
          </Link>
        </div>
      )}
    </header>
  );
}
