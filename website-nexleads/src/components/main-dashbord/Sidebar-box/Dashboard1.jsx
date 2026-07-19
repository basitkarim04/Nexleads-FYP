import React from 'react';
import { useDispatch, useSelector } from "react-redux";

import { Search, Mail, Clock, Folder, Moon, LogOut, Settings, Bell, Grid, ArrowUpRight, User, Menu } from 'lucide-react';
import { toUTCString } from '../../../utils/helpers';

const Dashboard1 = () => {
  const steps = [
    {
      label: "Leads",
      icon: <Search size={28} className="text-white" />,
      color: "bg-[#1f3b63]",
    },
    {
      label: "Emails",
      icon: <Mail size={28} className="text-white" />,
      color: "bg-[#254a7a]",
    },
    {
      label: "Response",
      icon: (
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      color: "bg-[#2e5a8c]",
    },
    {
      label: "Project",
      icon: (
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 7l8-4 8 4-8 4-8-4zm0 6l8 4 8-4m-16 0l8 4 8-4"
          />
        </svg>
      ),
      color: "bg-[#3c6aa0]",
    },
  ];
    const { dashboardStats, loading, error } = useSelector(
        (state) => state.userDetail
    );
    const statCards = [
        {
            title: 'Total Emails Sent',
            value: dashboardStats?.stats?.totalEmailsSent ?? 0,
            change: 'Increased from last month',
            gradient: true,
        },
        {
            title: 'Emails Opened',
            value: dashboardStats?.stats?.totalEmailsOpened ?? 0,
            change: 'Increased from last month',
            gradient: false,
        },
        {
            title: 'Responses Received',
            value: dashboardStats?.stats?.totalResponses ?? 0,
            change: 'Increased from last month',
            gradient: false,
        },
        {
            title: 'People Reached',
            value: dashboardStats?.stats?.totalLeads ?? 0,
            change: 'Increased from last month',
            gradient: false,
        },
    ];

    const projectColors = ['bg-pink-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-cyan-500', 'bg-emerald-500'];


    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm md:text-base text-gray-600">Plan, prioritize, and accomplish your task with ease</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {statCards.map((card, idx) => (
                    <div
                        key={idx}
                        className={`p-4 md:p-6 rounded-2xl ${card.gradient ? 'text-white' : 'bg-white'} relative`}
                        style={card.gradient ? { background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a7c 100%)' } : {}}
                    >
                        {/* <div className="absolute top-4 right-4 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-current flex items-center justify-center">
                            <ArrowUpRight size={16} />
                        </div> */}
                        <div className={`text-xs md:text-sm mb-2 ${card.gradient ? 'text-white/80' : 'text-gray-600'}`}>{card.title}</div>
                        <div className="text-3xl md:text-4xl font-bold mb-1">{card.value}</div>
                        <div className={`text-xs ${card.gradient ? 'text-white/70' : 'text-gray-500'}`}>{card.change}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                <div className="bg-white p-4 md:p-6 rounded-2xl lg:col-span-2">
                    <h2 className="text-lg md:text-xl font-bold mb-6">Emails Breakdown</h2>
                    <div className="space-y-4">
                        {[
                            {
                                label: 'Emails Sent',
                                percent: dashboardStats?.emailBreakdown?.sent ?? 0,
                                color: '#1e3a5f',
                            },
                            {
                                label: 'Emails Opened',
                                percent: dashboardStats?.emailBreakdown?.opened ?? 0,
                                color: '#5a7ba8',
                            },
                            {
                                label: 'Emails Responded',
                                percent: dashboardStats?.emailBreakdown?.responded ?? 0,
                                color: '#a8c8e8',
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm">{item.label}</span>
                                </div>
                                <span className="text-sm font-bold">{item.percent}%</span>
                            </div>
                        ))}
                        <div className="flex h-3 rounded-full overflow-hidden">
                            <div style={{ width: '70%', backgroundColor: '#1e3a5f' }}></div>
                            <div style={{ width: '20%', backgroundColor: '#5a7ba8' }}></div>
                            <div style={{ width: '10%', backgroundColor: '#a8c8e8' }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl lg:row-span-2">
                    <h2 className="text-lg md:text-xl font-bold mb-6">Current Projects</h2>
                    <div className="space-y-4">
                        {dashboardStats?.activeProjects?.map((p, i) => {
                            const bgColor = projectColors[i % projectColors.length];

                            return (
                                <div key={i} className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white`}>
                                        <User size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm truncate">{p.title}</div>
                                        <div className="text-xs text-gray-500">Due Date: {toUTCString(p.createdAt)}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* <div className="bg-white p-4 md:p-6 rounded-2xl lg:col-span-2">
                    <h2 className="text-lg md:text-xl font-bold mb-6">Funnel Lead Chart</h2>
                    <div className="flex items-center justify-between overflow-x-auto pb-2">
                        {[
                            { label: 'Leads', icon: <Search className="text-white" size={20} />, color: '#1e3a5f' },
                            { label: 'Emails', icon: <Mail className="text-white" size={20} />, color: '#2a4a7c' },
                            {
                                label: 'Response', icon: (
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                ), color: '#3a5a8c'
                            },
                            {
                                label: 'Project', icon: (
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                ), color: '#4a6a9c'
                            }
                        ].map((step, i) => (
                            <React.Fragment key={i}>
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-2" style={{ backgroundColor: step.color }}>
                                        {step.icon}
                                    </div>
                                    <span className="text-xs font-semibold">{step.label}</span>
                                </div>
                                {i < 3 && <ArrowUpRight className="text-gray-400 mx-2 flex-shrink-0" size={20} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div> */}
                <div className="bg-white p-4 md:p-6 rounded-2xl lg:col-span-2">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800">
        Funnel Lead Chart
      </h2>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Funnel Steps */}
      <div className="flex items-center justify-between overflow-x-auto">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step */}
            <div className="flex flex-col items-center min-w-[120px]">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-md`} style={{ background: 'linear-gradient(90deg, #021024 0%, #1F4682 100%)' }}
              >
                {step.icon}
              </div>
              <span className="mt-4 text-base font-semibold text-gray-700">
                {step.label}
              </span>
            </div>

            {/* Arrow */}
            {index < steps.length - 1 && (
              <div className="mx-6 text-gray-900 text-3xl">→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
            </div>
        </>
    )
}

export default Dashboard1