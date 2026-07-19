import React, { useEffect } from 'react'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Pricing from '../components/landing/Pricing'
import AboutUs from '../components/landing/Aboutus'
import Contact from '../components/landing/Contact'
import Footer from '../components/landing/Footer'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
    const navigate = useNavigate();

    // useEffect(() => {
    //     const token = localStorage.getItem("token");
    //     if (token) {
    //         toast.success("Auto Redirecting to dashboard...")
    //         setTimeout(() => {
    //              navigate("/dashboard");
    //         }, 2000);
    //       return;
    //     }
        
    //   }, []);

    return (
        <>
            <Navbar />
            <div className="page">
                <Hero />
                <Features />
                <HowItWorks />
                <Pricing />
                <AboutUs />
                <Contact />

            </div>
            <Footer />
        </>
    )
}

export default Landing