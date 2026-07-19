import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toUTCString } from '../../../utils/helpers';
import { JobLeads, updateLeadInterest } from '../../../Redux/Features/UserDetailSlice';
import { FollowTrackModal } from '../../modal/searchLeadsModal';

const DashboardTask = () => {
    const dispatch = useDispatch();

    const [platformOpen, setPlatformOpen] = useState(false);
    const [dateOpen, setDateOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState("All");
    const [selectedCard, setSelectedCard] = useState(null);
    const [followOpen, setFollowOpen] = useState(false);
    const [leadStatus, setLeadStatus] = useState("interested");
    const [followLeadIds, setFollowLeadIds] = React.useState([]);

    const platformRef = useRef(null);
    const dateRef = useRef(null);

    const { userLeads, loading, error } = useSelector(
        (state) => state.userDetail
    );

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (platformRef.current && !platformRef.current.contains(event.target)) {
                setPlatformOpen(false);
            }
            if (dateRef.current && !dateRef.current.contains(event.target)) {
                setDateOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const leadsByJobField = React.useMemo(() => {
        if (!userLeads?.leads) return {};

        return userLeads.leads.reduce((acc, lead) => {
            if (lead.status !== "contacted") return acc;

            if (!acc[lead.jobField]) {
                acc[lead.jobField] = [];
            }

            acc[lead.jobField].push(lead);
            return acc;
        }, {});
    }, [userLeads]);


    const selectedLeads = selectedCard
        ? (leadsByJobField[selectedCard] ?? []).filter(
            (lead) => lead.status === "contacted" || lead.status === "new"
        )
        : [];




    const handleStatusChange = async (index, leadId, value) => {
        // 1️⃣ Optimistic UI update
        const updated = [...leadStatus];
        updated[index] = value;
        setLeadStatus(updated);

        try {
            await dispatch(updateLeadInterest({
                leadId,
                interest: value,
            })).unwrap();

            dispatch(JobLeads());
        } catch (err) {
            console.error(err);
        }
    };


    const PLATFORM_STYLES = {
        twitter: {
            bg: "#D2F5FF",
            border: "#029FCA",
            text: "#029FCA",
            label: "Twitter",
        },
        upwork: {
            bg: "#FFD9D5",
            border: "#EA4335",
            text: "#EA4335",
            label: "Upwork",
        },
        facebook: {
            bg: "#E7F0FF",
            border: "#1877F2",
            text: "#1877F2",
            label: "Facebook",
        },
        linkedin: {
            bg: "#E8F4FF",
            border: "#0A66C2",
            text: "#0A66C2",
            label: "LinkedIn",
        },
    };

    const interestedLeadIds = React.useMemo(() => {
        return selectedLeads
            .filter((lead) => lead.interest === "interested")
            .map((lead) => lead._id);
    }, [selectedLeads]);


    return (
        <div className="bg-white rounded-3xl p-5 md:p-8">
            {!selectedCard ? (
                <div>

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-semibold text-[#0A2A55]">
                            Follow – up Tracking
                        </h1>
                        <p className="text-sm text-gray-500">
                            Monitor leads, responses, and follow-ups in one place.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        {/* Date Filter */}
                        <div className="w-full xl:w-1/4 relative" ref={dateRef}>
                            <button
                                onClick={() => setDateOpen(!dateOpen)}
                                className="w-full flex justify-between items-center px-4 py-3 bg-[#EAF6FF] border border-[#EAF6FF] rounded-xl text-gray-500 text-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <i className="ri-calendar-line"></i>
                                    {dateFrom && dateTo 
                                        ? `${dateFrom} - ${dateTo}` 
                                        : "Date: From - To"}
                                </span>
                                <i
                                    className={`ri-arrow-down-s-line text-xl transition-transform ${
                                        dateOpen ? "rotate-180" : ""
                                    }`}
                                ></i>
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

                        {/* Platform Filter */}
                        <div className="w-full xl:w-1/4 relative" ref={platformRef}>
                            <button
                                onClick={() => setPlatformOpen(!platformOpen)}
                                className={`w-full flex justify-between items-center px-4 py-3 bg-[#EEF8FF] border border-[#EEF8FF] rounded-xl text-sm transition-colors ${
                                    selectedPlatform !== "All" ? "text-blue-700 font-medium bg-blue-50 border-blue-200" : "text-gray-700"
                                }`}
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <i className="ri-apps-2-line text-lg text-gray-900 font-bold"></i>
                                    {selectedPlatform === "All" ? "Platforms" : selectedPlatform}
                                </span>
                                <i className={`ri-arrow-down-s-line text-xl text-gray-500 transition-transform ${platformOpen ? "rotate-180" : ""}`}></i>
                            </button>
                            
                            {platformOpen && (
                                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden animate-in fade-in zoom-in duration-200">
                                    {['All', 'Facebook', 'Twitter', 'LinkedIn', 'Upwork'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => { setSelectedPlatform(p); setPlatformOpen(false); }}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-[#EEF8FF] flex items-center justify-between"
                                        >
                                            <span className="flex items-center gap-2">
                                                {p === 'All' && <i className="ri-global-line text-gray-500"></i>}
                                                {p === 'Facebook' && <i className="ri-facebook-fill text-blue-600"></i>}
                                                {p === 'Twitter' && <i className="ri-twitter-x-fill text-black"></i>}
                                                {p === 'LinkedIn' && <i className="ri-linkedin-fill text-blue-700"></i>}
                                                {p === 'Upwork' && <i className="ri-briefcase-line text-green-600"></i>}
                                                {p === 'All' ? 'All Platforms' : p}
                                            </span>
                                            {selectedPlatform === p && <i className="ri-check-line text-blue-600 font-bold"></i>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <hr className="mb-6 border-t border-[#C3C3C3]" />
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                        {Object.entries(leadsByJobField).map(([jobField, leads]) => (
                            <div
                                key={jobField}
                                className="bg-[#EEF8FF] rounded-2xl p-5 cursor-pointer hover:shadow-md transition"
                                onClick={() => setSelectedCard(jobField)}
                            >
                                <p className="text-sm text-gray-400 mb-2">
                                    {toUTCString(leads[0].createdAt)} [{jobField}]
                                </p>

                                {/* Platforms */}
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {[...new Set(leads.map((lead) => lead.platform))].map((platform) => {
                                        const key = platform?.toLowerCase();
                                        const style = PLATFORM_STYLES[key];

                                        if (!style) return null;

                                        return (
                                            <span
                                                key={key}
                                                className="px-3 py-1 text-xs rounded-full border"
                                                style={{
                                                    backgroundColor: style.bg,
                                                    borderColor: style.border,
                                                    color: style.text,
                                                }}
                                            >
                                                {style.label}
                                            </span>
                                        );
                                    })}
                                </div>

                                {/* Stats */}
                                <div className="bg-white rounded-xl px-4 py-3 mb-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-400">Total Leads</p>
                                        <p className="text-3xl font-semibold text-[#0A2A55]">{leads.length}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Follow-Up Sent</p>
                                        <p className="text-3xl font-semibold text-[#0A2A55]">{leads.reduce((a, l) => a + l.emailsSent, 0)}</p>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <button className="w-full bg-[#7DA0CA] hover:bg-[#7AA4CE] text-white py-2 rounded-xl text-sm flex items-center justify-center gap-2"
                                    onClick={() => {
                                        if (interestedLeadIds.length > 0) return;
                                        setFollowLeadIds(interestedLeadIds); 
                                        setFollowOpen(true);
                                    }}
                                >
                                    <i className="ri-send-plane-line"></i>
                                    Send Follow-Up
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // DETAIL VIEW
                <div className="w-full flex flex-col lg:flex-row gap-6 mt-6">

                    {/* LEFT CONTENT — JOB BOARD */}
                    <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border space-y-6">
                        <div className=" justify-between items-center">
                            <button
                                className="text-sm text-black font-bold hover:underline mb-5"
                                onClick={() => setSelectedCard(null)} // back button
                            >
                                ← Back
                            </button>
                            <h1 className="text-3xl font-medium text-[#000000]">{selectedCard} Board</h1>
                        </div>
                        {/* <p className="text-gray-900 mt-1">Date: 08-01-2026</p> */}

                        {/* Jobs Table */}
                        <div className="overflow-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-3 px-2 font-medium text-[#000000]">Name</th>
                                        <th className="py-3 px-2 font-medium text-[#000000]">Description</th>
                                        <th className="py-3 px-2 font-medium text-[#000000]">Email</th>
                                        <th className="py-3 px-2 font-medium text-[#000000]">Platform</th>
                                        <th className="py-3 px-2 font-medium text-[#000000]">Date</th>
                                        <th className="py-3 px-2 font-medium text-[#000000]">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {selectedLeads.map((lead, i) => (
                                        <tr key={lead.email} className="border-b text-gray-700">

                                            {/* STATUS */}
                                            <td className="py-3 px-2">{lead.name}</td>
                                            <td className="py-3 px-2">{lead.jobTitle}</td>
                                            <td className="py-3 px-2">{lead.email}</td>
                                            <td className="py-3 px-2">{lead.platform}</td>
                                            <td className="py-3 px-2">
                                                {toUTCString(lead.createdAt)}
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2">

                                                    {/* EMAIL ICON */}
                                                    <button
                                                        onClick={() => {
                                                            // if (interestedLeadIds.length > 0) return;
                                                            setFollowLeadIds([lead._id]); 
                                                            setFollowOpen(true);
                                                        }}
                                                        className="hover:text-blue-700"
                                                    >
                                                        <i className="ri-mail-line text-lg text-[#052659]"></i>
                                                    </button>

                                                    {/* STATUS DROPDOWN */}
                                                    <select
                                                        value={lead.interest || "interested"}
                                                        onChange={(e) =>
                                                            handleStatusChange(i, lead._id, e.target.value)
                                                        }
                                                        className={`text-xs px-2 py-1 rounded-lg border cursor-pointer outline-none
        ${lead.interest === "interested"
                                                                ? "bg-green-200 text-green-700 border-green-300"
                                                                : "bg-red-200 text-red-700 border-red-300"
                                                            }`}
                                                    >
                                                        <option value="interested">Interested</option>
                                                        <option value="not_interested">Not Interested</option>
                                                    </select>

                                                </div>
                                            </td>
                                        </tr>

                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}


            {followOpen && (
                <FollowTrackModal
                    leadIds={followLeadIds}
                    onClose={() => setFollowOpen(false)}
                />
            )}


        </div>
    )
}

export default DashboardTask;