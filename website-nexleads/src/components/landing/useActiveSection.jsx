import { useEffect, useState } from "react";

export function useActiveSection(sectionIds) {
  const [activeId, setActiveId] = useState("home"); // default to home

  useEffect(() => {
    const observers = [];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(id);
            }
          });
        },
        {
          threshold: 0.5,
          rootMargin: "-70px 0px 0px 0px", // adjust for navbar height
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [sectionIds]);

  return activeId;
}
