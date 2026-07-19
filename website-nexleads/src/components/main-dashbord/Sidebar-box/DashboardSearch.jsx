import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { JobLeads, searchLeads, sendEmails } from '../../../Redux/Features/UserDetailSlice';
import { toast } from 'react-toastify';
import { Ai_Assists, SearchLeadsModal } from '../../modal/searchLeadsModal';

const DashboardSearch = () => {
  const dispatch = useDispatch();
  const { userLeads, loading, error } = useSelector(
    (state) => state.userDetail
  );

  const [searchOpen, setSearchOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const editorRef = useRef(null);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState("rewrite");

  // --- FILTERS STATE ---
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  const [platformOpen, setPlatformOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  
  const [dateOpen, setDateOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const platformRef = useRef(null);
  const dateRef = useRef(null);

  // --- CLICK OUTSIDE HANDLER ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (platformRef.current && !platformRef.current.contains(event.target)) {
        setPlatformOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- DEBOUNCE SEARCH (300ms) ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(localSearchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearchTerm]);


  // ==========================================
  //  CRITICAL FIX: DATE FILTERING LOGIC
  // ==========================================
  const filteredLeads = userLeads?.leads?.filter((lead) => {
    
    // 1. KEYWORD FILTER (Search Box)
    const searchLower = debouncedSearchTerm.toLowerCase();
    const matchesSearch = !debouncedSearchTerm || (
      lead.name?.toLowerCase().includes(searchLower) ||
      lead.jobTitle?.toLowerCase().includes(searchLower) ||
      lead.jobField?.toLowerCase().includes(searchLower) ||
      lead.platform?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower)
    );

    // 2. PLATFORM FILTER
    const matchesPlatform = selectedPlatform === "All" || 
      lead.platform?.toLowerCase() === selectedPlatform.toLowerCase();

    // 3. DATE FILTER (STRICT MODE)
    let matchesDate = true;
    
    if (dateFrom || dateTo) {
      const leadDate = new Date(lead.createdAt);
      
      // Validate lead date (handle invalid DB dates)
      if (isNaN(leadDate.getTime())) {
        matchesDate = false; 
      } else {
        const leadTimestamp = leadDate.getTime();

        // Create Start of Day (00:00:00) for From Date
        let startTimestamp = dateFrom 
          ? new Date(dateFrom).setHours(0, 0, 0, 0) 
          : 0; // Epoch start if no From date

        // Create End of Day (23:59:59) for To Date
        let endTimestamp = dateTo 
          ? new Date(dateTo).setHours(23, 59, 59, 999) 
          : 8640000000000000; // Max future date if no To date

        // EDGE CASE: Handle user selecting From > To (Swap logic)
        if (dateFrom && dateTo && startTimestamp > endTimestamp) {
          const temp = startTimestamp;
          startTimestamp = new Date(dateTo).setHours(0, 0, 0, 0);
          endTimestamp = new Date(dateFrom).setHours(23, 59, 59, 999);
        }

        // Strict comparison
        matchesDate = leadTimestamp >= startTimestamp && leadTimestamp <= endTimestamp;

        // DEBUG: Uncomment to verify date logic in console
        // console.log(`Lead: ${lead.name}, Date: ${lead.createdAt}, In Range: ${matchesDate}`);
      }
    }

    // AND LOGIC: All conditions must be met
    return matchesSearch && matchesPlatform && matchesDate;
  }) || [];


  // --- UI HELPER: BUTTON TEXT DISPLAY ---
  const getDateDisplay = () => {
    if (dateFrom && dateTo) {
      // Check for swapped display if user entered backwards
      if (new Date(dateFrom) > new Date(dateTo)) return `${dateTo} to ${dateFrom}`;
      return `${dateFrom} to ${dateTo}`;
    }
    if (dateFrom) return `From ${dateFrom}`;
    if (dateTo) return `Until ${dateTo}`;
    return "All Dates";
  };

  const clearAllFilters = () => {
    setLocalSearchTerm("");
    setSelectedPlatform("All");
    setDateFrom("");
    setDateTo("");
  };

  const clearDateFilter = (e) => {
    e.stopPropagation(); // Prevent dropdown toggle
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = debouncedSearchTerm || selectedPlatform !== "All" || dateFrom || dateTo;


  // --- DRAG & DROP & REDUX ---
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const onSubmit = async ({ keyword, platforms, dateFrom, dateTo }) => {
    await dispatch(searchLeads({ keyword, platforms, dateFrom, dateTo }));
    dispatch(JobLeads());
  };

  const [selectedLeads, setSelectedLeads] = useState([]);

  const toggleLead = (leadId) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter((id) => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead._id));
    }
  };

  const handleSend = async () => {
    if (selectedLeads.length === 0) return toast.info('Select at least 1 lead');
    await dispatch(sendEmails({ subject, body, attachments, leadIds: selectedLeads }));
    setSubject(''); setBody(''); setAttachments([]); setSelectedLeads([]);
  };

  const formatText = (command) => {
    document.execCommand(command, false, null);
  };

  return (
    <>
      <div className="w-full flex flex-col lg:flex-row gap-6">

        {/* LEFT CONTENT — JOB BOARD */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border space-y-6">

          {/* Job Board Header */}
          <div className="w-full flex flex-col lg:flex-row gap-6 space-y-6 justify-between">
            <div>
              <h1 className="text-3xl font-medium text-[#000000]">Job Board</h1>
              <p className="text-gray-900 mt-1">
                Find leads, email them, close the deal, and happily earn.
              </p>
            </div>
            <div className="searchLeads">
              <button className="text-sm text-[#FFFFFF] font-medium hover:underline bg-[#052659] pr-5 pl-5 pt-2 pb-2 border border-[#052659] rounded-xl "
                onClick={() => { setSearchOpen(true) }}
              >Search For Leads</button>
            </div>
          </div>

          {/* --- SEARCH & FILTERS CONTAINER --- */}
          <div className="flex flex-col xl:flex-row items-center gap-4">
            
            {/* 1. KEYWORD SEARCH */}
            <div className="flex items-center w-full xl:w-2/5 px-4 py-3 bg-[#EEF8FF] border border-[#EEF8FF] rounded-xl transition-all focus-within:border-blue-300">
              <i className="ri-search-line text-lg text-gray-900 font-bold"></i>
              <input
                type="text"
                placeholder="Search by job title, keywords…"
                className="flex-1 bg-transparent outline-none text-gray-700 ml-2 text-sm"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
              />
              {localSearchTerm && (
                <button onClick={() => setLocalSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line"></i>
                </button>
              )}
            </div>

            {/* 2. PLATFORM FILTER */}
            <div className="w-full xl:w-1/4 relative" ref={platformRef}>
              <button
                onClick={() => setPlatformOpen(!platformOpen)}
                className={`w-full flex justify-between items-center px-4 py-3 bg-[#EEF8FF] border border-[#EEF8FF] rounded-xl text-sm transition-colors ${selectedPlatform !== "All" ? "text-blue-700 font-medium bg-blue-50 border-blue-200" : "text-gray-700"}`}
              >
                <span className="flex items-center gap-2 truncate">
                  <i className="ri-apps-2-line text-lg text-gray-900 font-bold"></i>
                  {selectedPlatform === "All" ? "Platforms" : selectedPlatform}
                </span>
                <i className={`ri-arrow-down-s-line text-xl text-gray-500 transition-transform ${platformOpen ? "rotate-180" : ""}`}></i>
              </button>
              
              {platformOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden animate-in fade-in zoom-in duration-200">
                  {['All', 'Facebook', 'Twitter'].map((p) => (
                    <button
                      key={p}
                      onClick={() => { setSelectedPlatform(p); setPlatformOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-[#EEF8FF] flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        {p === 'All' && <i className="ri-global-line text-gray-500"></i>}
                        {p === 'Facebook' && <i className="ri-facebook-fill text-blue-600"></i>}
                        {p === 'Twitter' && <i className="ri-twitter-x-fill text-black"></i>}
                        {p === 'All' ? 'All Platforms' : p}
                      </span>
                      {selectedPlatform === p && <i className="ri-check-line text-blue-600 font-bold"></i>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. DATE FILTER */}
            <div className="w-full xl:w-auto relative flex-1" ref={dateRef}>
              <button 
                onClick={() => setDateOpen(!dateOpen)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 bg-[#EEF8FF] border border-[#EEF8FF] rounded-xl text-sm transition-colors ${(dateFrom || dateTo) ? "text-blue-700 font-medium bg-blue-50 border-blue-200" : "text-gray-700"}`}
              >
                <span className="flex items-center gap-2 truncate">
                  <i className="ri-calendar-event-line text-lg text-gray-900"></i>
                  {getDateDisplay()}
                </span>
                
                {/* Clear '×' button if date filter is active */}
                {(dateFrom || dateTo) ? (
                   <div onClick={clearDateFilter} className="p-1 hover:bg-blue-100 rounded-full cursor-pointer transition">
                      <i className="ri-close-line text-lg"></i>
                   </div>
                ) : (
                  <i className={`ri-arrow-down-s-line text-xl text-gray-500 transition-transform ${dateOpen ? "rotate-180" : ""}`}></i>
                )}
              </button>

              {dateOpen && (
              <div className="absolute z-50 mt-2 right-0 xl:left-0 w-full xl:w-[320px] bg-white border border-gray-200 rounded-xl shadow-md p-4 animate-in fade-in zoom-in duration-200">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-gray-600 mb-1">FROM DATE</label>
                    <input 
                      type="date" 
                      value={dateFrom} 
                      onChange={(e) => setDateFrom(e.target.value)} 
                      className="w-full border rounded-lg p-2 text-sm text-gray-700 outline-none focus:border-blue-400 max-w-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-gray-600 mb-1">TO DATE</label>
                    <input 
                      type="date" 
                      value={dateTo} 
                      onChange={(e) => setDateTo(e.target.value)} 
                      className="w-full border rounded-lg p-2 text-sm text-gray-700 outline-none focus:border-blue-400 max-w-full"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <button 
                    onClick={() => { setDateFrom(""); setDateTo(""); }} 
                    className="text-sm text-gray-500 hover:text-red-500"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setDateOpen(false)} 
                    className="text-sm bg-[#052659] text-white px-4 py-1.5 rounded-lg hover:bg-blue-800"
                  >
                    Done
                  </button>
                </div>
              </div>
              )}
            </div>

          </div>

          {/* Filter Summary & Count */}
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <p className="font-medium text-gray-600">
                found <span className="text-[#9711B9] font-semibold">{filteredLeads.length}</span> Jobs!
              </p>
              
              {hasActiveFilters && (
                <button 
                  onClick={clearAllFilters}
                  className="text-xs flex items-center gap-1 text-gray-500 hover:text-red-500 bg-gray-100 px-2 py-1 rounded-full transition-colors"
                >
                  <i className="ri-close-circle-fill"></i> Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Jobs Table */}
          <div className="overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-3 px-2 font-medium text-[#000000]">Name</th>
                  <th className="py-3 px-2 font-medium text-[#000000]">Description</th>
                  <th className="py-3 px-2 font-medium text-[#000000]">Email</th>
                  <th className="py-3 px-2 font-medium text-[#000000]">Platform</th>
                  <th className="py-3 px-2 font-medium text-[#000000]">Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead, i) => (
                  <tr key={i} className="border-b text-gray-700 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead._id)}
                        onChange={() => toggleLead(lead._id)}
                      />
                    </td>
                    <td className="py-3 px-2">{lead.name}</td>
                    <td className="py-3 px-2">{lead.jobTitle} - {lead.jobField}</td>
                    <td className="py-3 px-2">{lead.email}</td>
                    <td className="py-3 px-2">
                      {lead.platform?.toLowerCase() === 'facebook' && <i className="ri-facebook-circle-fill text-blue-600 mr-1"></i>}
                      {lead.platform?.toLowerCase() === 'twitter' && <i className="ri-twitter-x-fill text-black mr-1"></i>}
                      {lead.platform}
                    </td>
                    <td className="py-3 px-2">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <i className="ri-filter-off-line text-3xl text-gray-300"></i>
                        <p>No results found for your filters.</p>
                        {hasActiveFilters && (
                           <div className="text-sm mt-1">
                             <span className="block text-gray-400 text-xs mb-2">
                               Filter: {debouncedSearchTerm && `"${debouncedSearchTerm}" `} 
                               {selectedPlatform !== "All" && `+ ${selectedPlatform} `}
                               {(dateFrom || dateTo) && `+ Date`}
                             </span>
                             <button onClick={clearAllFilters} className="text-blue-500 hover:underline">
                               Clear filters to reset
                             </button>
                           </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button className="text-[#052659] font-medium mt-2">See more ▼</button>
        </div>

        {/* RIGHT PANEL — COMPOSE MAIL (UNCHANGED) */}
        <div className="lg:w-1/3 bg-white rounded-3xl p-6 shadow-sm border h-fit">
          <h2 className="text-xl font-medium mb-4 text-[#000000] text-center">COMPOSE MAIL</h2>
          <input
            type="text"
            placeholder="Subject Line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full mb-3 px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none"
          />
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none resize-none min-h-[180px]"
            onInput={(e) => setBody(e.currentTarget.innerHTML)}
          ></div>
          <div className="flex items-center gap-4 mt-4 text-gray-700 px-2">
            <button type="button" onClick={() => formatText("bold")} className="font-bold">B</button>
            <button type="button" onClick={() => formatText("italic")} className="italic">I</button>
            <button type="button" onClick={() => formatText("underline")} className="underline">U</button>
            <i className="ri-list-unordered"></i>
            <i className="ri-list-ordered"></i>
            <button
              type="button"
              onClick={() => setShowAI(true)}
              className="px-3 py-1 bg-[#EEF8FF] text-[#000000] rounded-lg text-sm">
              AI Assist
            </button>
          </div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')}
            className="mt-5 p-4 border-2 border-dashed border-gray-300 rounded-xl text-center text-sm text-gray-500 hover:border-blue-400 transition"
          >
            <p>Drag & drop files here </p>
            <button type="button" className="text-blue-600 hover:underline mt-1">browse files</button>
            <input type="file" multiple onChange={handleFileInput} className="ml-2" style={{ position: 'relative', bottom: '25px', opacity: 0, }} />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {attachments.map((file, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-200 rounded">{file.name}</span>
            ))}
          </div>
          <button
            onClick={handleSend}
            className="w-full mt-6 py-3 bg-[#052659] text-white rounded-xl font-medium hover:bg-blue-800">
            {loading ? "Sending..." : "Send to all Selected"}
          </button>
        </div>

        {searchOpen &&
          <SearchLeadsModal
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSubmit={onSubmit}
          />
        }
      </div>

      {showAI && (
        <Ai_Assists
          editorRef={editorRef}
          aiMode={aiMode}
          setAiMode={setAiMode}
          setAiPrompt={setAiPrompt}
          aiPrompt={aiPrompt}
          setShowAI={setShowAI}
          setBody={setBody}
          body={body}
          setSubject={setSubject}
        />
      )}
    </>
  )
}

export default DashboardSearch