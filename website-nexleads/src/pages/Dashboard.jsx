import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Search, Mail, Clock, Folder, Moon, LogOut, Settings, Bell, Grid, ArrowUpRight, User, Menu } from 'lucide-react';
import nexLeadlogo from "../assets/Images/nexLeadLogo.png";

import Dashboard1 from '../components/main-dashbord/Sidebar-box/Dashboard1';
import DashboardSearch from '../components/main-dashbord/Sidebar-box/DashboardSearch';
import Dashboardemail from '../components/main-dashbord/Sidebar-box/Dashboardemail';
import DashboardTask from '../components/main-dashbord/Sidebar-box/DashboardTask';
import DashboardProject from '../components/main-dashbord/DashboardProject';
import DashboardSetting from '../components/main-dashbord/Sidebar-box/DashboardSetting';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardStats, getProjects, JobLeads, userData } from '../Redux/Features/UserDetailSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userDetails, loading, error } = useSelector(
    (state) => state.userDetail
  );

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("activePage") || "dashboard";
  });

  // --- SEARCH FUNCTIONALITY STATES & REFS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null); // Ref for desktop search
  const mobileSearchRef = useRef(null);    // Ref for mobile search
  const sidebarRef = useRef(null);

  // Navigation Options Mapping
  const navOptions = [
    { label: "Dashboard Overview", page: "dashboard" },
    { label: "Job Board", page: "search" },
    { label: "Inbox", page: "emails" },
    { label: "Follow-up Tracking", page: "tasks" },
    { label: "Projects", page: "projects" },
    { label: "Settings", page: "settings" },
  ];

  // Handle clicking a search result
  const handleSearchNavigation = (pageKey) => {
    setActivePage(pageKey);
    setSearchQuery("");
    setShowSearchDropdown(false);
    setMobileSearchOpen(false); // Close mobile search bar if open
  };

  // Filter options based on input
  const filteredNavOptions = navOptions.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Click Outside for Sidebar and Search Dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      // Sidebar logic
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }

      // Search Dropdown logic (Desktop)
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      
       // Search Dropdown logic (Mobile)
       if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        // Only close dropdown, let the toggle button handle the main container
        if(mobileSearchOpen) setShowSearchDropdown(false); 
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen, mobileSearchOpen]);

  useEffect(() => {
    dispatch(userData());
    dispatch(DashboardStats());
    dispatch(JobLeads());
    dispatch(getProjects());

    localStorage.setItem("activePage", activePage);
  }, [activePage]);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard1 />;
      case "search": return <DashboardSearch />;
      case "emails": return <Dashboardemail />;
      case "tasks": return <DashboardTask />;
      case "projects": return <DashboardProject />;
      case "settings": return <DashboardSetting />;
      default: return <h1 className="text-3xl font-bold">Page Not Found</h1>;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.indexedDB.databases().then((dbs) => {
      dbs.forEach((db) => {
        window.indexedDB.deleteDatabase(db.name);
      });
    });
    navigate("/");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FFF' }}>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        sidebar-menu md:translate-x-0 w-24 h-screen flex-shrink-0 flex flex-col items-center py-6 fixed md:sticky top-0 left-0 z-50 
        transition-transform duration-300 md:transition-none`}
      >
        <div className="mb-2 ml-4 flex w-30 items-center justify-center">
          <img
            src={nexLeadlogo}
            alt="Nex Leads Logo"
            className="w-full h-full"
          />
        </div>

        {/* Navigation Icons */}
        <div className="flex-1 flex flex-col items-center space-y-3 overflow-y-auto">
          {[
            { icon: Grid, page: "dashboard" },
            { icon: Search, page: "search" },
            { icon: Mail, page: "emails" },
            { icon: Clock, page: "tasks" },
            { icon: Folder, page: "projects" },
            { icon: Settings, page: "settings" }
          ].map(({ icon: Icon, page }, i) => (
            <button
              key={i}
              onClick={() => setActivePage(page)}
              className={`p-3 rounded-xl transition ${activePage === page ? "bg-[#5F81AF] text-white text-bold" : "text-white"
                }`}
            >
              <Icon size={24} />
            </button>
          ))}
        </div>

        {/* Bottom icons */}
        <div className="flex flex-col items-center space-y-3 mt-auto">
          <button className="p-3 text-white hover:bg-white/20 rounded-xl transition" onClick={handleLogout} >
            <LogOut size={24} />
          </button>
          <div className="w-12 h-12 rounded-full bg-blue-300 flex items-center justify-center">
            <User size={24} className="text-blue-900" />
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="main-section flex-1 flex flex-col overflow-hidden w-full md:w-auto">

        {/* HEADER */}
        <div className="main-section-header bg-[#EEF8FF] flex items-center justify-between px-2 md:px-4 py-3 relative">

          {/* Sidebar Toggle (Mobile only) */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>

          {/* DESKTOP SEARCH BAR */}
          <div 
            ref={searchContainerRef}
            className="hidden md:flex flex-col relative w-full md:w-1/2 lg:w-1/3 xl:w-1/4"
          >
            <div className="flex items-center w-full px-2 py-2 bg-white border border-white rounded-xl z-20">
              <i className="ri-search-line text-lg text-gray-900 font-bold"></i>
              <input
                type="text"
                placeholder="Search"
                className="flex-1 bg-transparent outline-none text-gray-700 ml-2 text-sm px-2 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
              />
            </div>

            {/* SEARCH DROPDOWN */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                {filteredNavOptions.length > 0 ? (
                  filteredNavOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-2"
                      onClick={() => handleSearchNavigation(opt.page)}
                    >
                      <Search size={14} className="text-gray-400" />
                      {opt.label}
                    </div>
                  ))
                ) : (
                   <div className="px-4 py-3 text-sm text-gray-400">No navigation found</div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* MOBILE SEARCH ICON */}
            <button
              className="md:hidden"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <i className="ri-search-line text-xl text-gray-900"></i>
            </button>

            {/* USER */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-300 flex items-center justify-center">
                <img src={userDetails?.profilePicture ?? <User size={20} className="text-blue-900" />} alt="" className='object-cover  rounded-full' />
              </div>
              <div className="hidden md:block">
                <div className="font-semibold text-sm">{userDetails?.name}</div>
                <div className="text-xs text-gray-500">{userDetails?.nexleadsEmail}</div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE SEARCH BAR */}
        <div
          ref={mobileSearchRef}
          className={`md:hidden transition-all duration-300 overflow-visible relative z-40 ${mobileSearchOpen ? "max-h-[300px] opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}
        >
          <div className="m-auto flex items-center w-[90%] px-4 py-4 bg-[#EEF8FF] border border-white rounded-[30px] relative">
            <i className="ri-search-line text-lg text-gray-900 font-bold"></i>
            <input
              type="text"
              placeholder="Search"
              className="flex-1 bg-transparent outline-none text-gray-700 ml-2 text-sm px-2 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
            />
          </div>
          
           {/* MOBILE SEARCH DROPDOWN */}
           {showSearchDropdown && mobileSearchOpen && (
              <div className="w-[90%] mx-auto mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {filteredNavOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                    onClick={() => handleSearchNavigation(opt.page)}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Dynamic Page Content */}
        <div className="dyanamic-page-content flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-blue-50 space-y-5">
          {renderPage()}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;