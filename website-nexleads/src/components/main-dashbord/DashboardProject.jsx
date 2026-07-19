import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects, updateProject } from '../../Redux/Features/UserDetailSlice';
import { toUTCString } from '../../utils/helpers';

const DashboardProject = () => {
    const dispatch = useDispatch();
    const { userProjects, loading, error } = useSelector(
        (state) => state.userDetail
    );

    const [selectedItem, setSelectedItem] = useState(null);

  
    const onUpdate = async (status) => {
    const payload = {
        projectId: selectedItem._id,
        status: status, 
    };

    await dispatch(updateProject(payload)); 
    dispatch(getProjects());
};


    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
            {/* Header */}
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                Projects
            </h1>
            <hr className="mb-6" />

            {/* Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* ================= IN DISCUSSION ================= */}
                <div className="bg-[#EEF8FF] rounded-t-2xl">
                    <div className="bg-[#C1E8FF] mb-4 p-4 rounded-t-2xl text-center">
                        <h2 className="font-semibold text-lg">In Discussion</h2>
                    </div>

                    <div className="space-y-4 p-4">
                        {userProjects?.projects?.in_discussion?.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedItem(item)} className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{item?.title}</h3>
                                    <span className="text-xs bg-red-100 text-red-500 px-3 py-1 rounded-full">
                                        Lead
                                    </span>
                                </div>

                                <p className="text-sm text-gray-500 mt-1">{item?.company}</p>

                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                    <i className="ri-calendar-line"></i>
                                    {toUTCString(item?.createdAt)}
                                </div>
                            </div>
                        ))}

                        {selectedItem && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

                                <div className="w-full max-w-xl bg-white rounded-2xl overflow-hidden">

                                    {/* HEADER */}
                                    <div className="flex items-center justify-between p-4 border-b">
                                        <div>
                                            <h2 className="font-semibold text-lg">{selectedItem.title}</h2>
                                            <p className="text-sm text-gray-500">{selectedItem.company}</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
                                                {selectedItem.status}
                                            </span>

                                            {/* CLOSE BUTTON */}
                                            <button
                                                onClick={() => setSelectedItem(null)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                                            >
                                                <i className="ri-close-line text-xl text-gray-600"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* INFO BAR */}
                                    <div className="bg-[#C1E8FF] px-4 py-3 flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <i className="ri-calendar-line"></i>
                                            <span>Start: {toUTCString(selectedItem?.createdAt)}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span>|</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <i className="ri-time-line"></i>
                                            <span>Status:</span>
                                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
                                                {selectedItem.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="p-4 space-y-4">
                                        <div>
                                            <h3 className="font-semibold mb-1">Details</h3>
                                            <p className="text-sm text-gray-600">{selectedItem.details}</p>
                                        </div>
                                    </div>

                                    {/* FOOTER */}
                                    <div className="p-4 border-t flex justify-end">
                                       {selectedItem?.status === "in_discussion" && (
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm"
                                            onClick={() => onUpdate("ongoing")}
                                        >
                                            Mark as Ongoing
                                        </button>
                                    )}

                                    {selectedItem?.status === "ongoing" && (
                                        <button
                                            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-sm"
                                            onClick={() => onUpdate("completed")}
                                        >
                                            Mark as Completed
                                        </button>
                                    )}
                                    {selectedItem?.status === "completed" && (
                                        <button
                                            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-sm"
                                            onClick={() => onUpdate("completed")}
                                        >
                                            Completed
                                        </button>
                                    )}

                                    </div>

                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* ================= ONGOING ================= */}
                <div className="bg-[#EEF8FF] rounded-t-2xl">
                    <div className="bg-[#C1E8FF] mb-4 p-4 rounded-t-2xl text-center">
                        <h2 className="font-semibold text-lg">Ongoing</h2>
                    </div>

                    <div className="space-y-4 p-4">
                        {userProjects?.projects?.ongoing.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedItem(item)} className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
                                        Ongoing
                                    </span>
                                </div>

                                <p className="text-sm text-gray-500 mt-1">{item.company}</p>

                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                    <i className="ri-calendar-line"></i>
                                    {toUTCString(item.startedAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= COMPLETED ================= */}
                <div className="bg-[#EEF8FF] rounded-t-2xl">
                    <div className="bg-[#C1E8FF] mb-4 p-4 rounded-t-2xl text-center">
                        <h2 className="font-semibold text-lg">Completed</h2>
                    </div>


                    <div className="bg-[#EEF8FF] space-y-4 p-4">
                        {userProjects?.projects?.completed.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedItem(item)} className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full">
                                        Completed
                                    </span>
                                </div>

                                <p className="text-sm text-gray-500 mt-1">{item.company}</p>

                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                    <i className="ri-calendar-line"></i>
                                    {toUTCString(item.completedAt)}
                                </div>
                            </div>
                        ))}


                    </div>
                </div>

            </div>
        </div>
    )
}

export default DashboardProject