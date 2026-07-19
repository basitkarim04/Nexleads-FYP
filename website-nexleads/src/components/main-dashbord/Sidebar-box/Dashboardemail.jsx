import React, { useState, useEffect } from 'react';
import { createProject, getEmails, moveFolderEmail, upsetEmail } from '../../../Redux/Features/UserDetailSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toUTCString } from '../../../utils/helpers';

const Dashboardemail = () => {
    const dispatch = useDispatch();
    const { userEmails, loading, error } = useSelector(
        (state) => state.userDetail
    );

    const foldersList = ["inbox", "sent", "trash"];
    // Email
    // Forward
    const [showForward, setShowForward] = useState(false);
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);
    const [forwardData, setForwardData] = useState({
        to: "",
        cc: "",
        bcc: "",
    });
    // Reply
    const [showReply, setShowReply] = useState(false);
    const [showReplyCc, setShowReplyCc] = useState(false);
    const [showReplyBcc, setShowReplyBcc] = useState(false);
    const [replyData, setReplyData] = useState({
        to: "",
        cc: "",
        bcc: "",
        body: "",
    });
    //Compose
    const [composeData, setComposeData] = useState({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        body: "",
    });
    const [showComposeCc, setShowComposeCc] = useState(false);
    const [showComposeBcc, setShowComposeBcc] = useState(false);


    const [open, setOpen] = useState(false);
    const [activeFolder, setActiveFolder] = useState('inbox');
    const [selectedMail, setSelectedMail] = useState(null);
    const [isComposing, setIsComposing] = useState(false);

   const [emailCount, setEmailCount] = useState({
  inbox: 0,
  sent: 0,
  trash: 0,
});

    useEffect(() => {
        localStorage.setItem("activeFolder", activeFolder);
    }, [activeFolder]);

    const folders = {
        inbox: [
            {
                id: 1,
                sender: "Anas R.",
                subject: "Meeting reschedule",
                preview: "Can we move our...",
                body:
                    "Hi Mohsin,\n\nCan we move our meeting to tomorrow?\n\nRegards,\nAnas",
                date: "10:20 AM",
                from: "anas@gmail.com",
            },
            {
                id: 2,
                sender: "Basit Karim",
                subject: "Web dev Proposal",
                preview: "Hi Mohsin, I have seen...",
                body:
                    "Hi Mohsin,\n\nI have seen your proposal. I really liked it.\n\nRegards,\nBasit",
                date: "Yesterday",
                from: "basit@gmail.com",
            },
        ],

        sent: [
            {
                id: 3,
                sender: "Me",
                subject: "Project Update",
                preview: "Hi Nex Leads...",
                body: "Here is the project update.",
                date: "9:15 AM",
                from: "me@nexleads.com",
            },
        ],

        drafts: [
            {
                id: 4,
                sender: "Draft",
                subject: "Unfinished Proposal",
                preview: "Still working on...",
                body: "Draft content here...",
                date: "1w ago",
                from: "me@nexleads.com",
            },
        ],

        spam: [],
        trash: [],
    };
    const mails = folders[activeFolder] || [];

    const folderIcons = {
        inbox: "ri-inbox-line",
        sent: "ri-send-plane-line",
        drafts: "ri-draft-line",
        spam: "ri-spam-2-line",
        trash: "ri-delete-bin-line",
    };

   useEffect(() => {
  const fetchCounts = async () => {
    const results = await Promise.all(
      foldersList.map((folder) =>
        dispatch(getEmails(folder))
          .unwrap()
          .then((res) => ({ folder, count: res.count }))
      )
    );

    const counts = {};
    results.forEach(({ folder, count }) => {
      counts[folder] = count;
    });

    setEmailCount((prev) => ({ ...prev, ...counts }));
  };

  fetchCounts();
}, []);

    useEffect(() => {
        dispatch(getEmails(activeFolder));
    }, [activeFolder])

    const onSubmit = async () => {
        const payload = {
            body: replyData.body,
            emailId: selectedMail._id,
        };

        await dispatch(upsetEmail(payload));
        dispatch(getEmails(activeFolder));
        setShowReply(false);
    };
    const onDelete = async () => {

        const payload = {
            emailId: selectedMail._id,
            folder: 'trash'
        };

        await dispatch(moveFolderEmail(payload));
        dispatch(getEmails(activeFolder));
    };
    const onUpdate = async () => {
        const payload = {
            leadId: selectedMail.leadId._id,
            title: selectedMail.leadId.jobTitle,
            company: selectedMail.leadId.company,
        };

        await dispatch(createProject(payload));
        setOpen(false);
    };

    return (
        <div className="h-full w-full main-email">
            <div className="h-full w-full bg-[#EEF8FF] email-desktop-version mx-auto">
                <div className="h-full bg-white rounded-2xl overflow-hidden flex">

                    {/* ================= SIDEBAR ================= */}
                    <aside className="w-64 bg-[#072A5A] text-white h-full p-4 hidden md:flex flex-col rounded-l-2xl">
                        <h2 className="text-xl font-bold mb-6 capitalize">{activeFolder}</h2>

                        <nav className="space-y-2 text-sm">
                            {foldersList.map((folder) => {
                                if (folder === "compose") {
                                    return (
                                        <div
                                            key="compose"
                                            onClick={() => {
                                                setIsComposing(true);
                                                setSelectedMail(null);
                                                setComposeData({ to: "", subject: "", body: "" });
                                                setActiveFolder("compose");
                                            }}
                                            className="flex items-center gap-3 bg-[#EEF8FF] hover:bg-[#5F81AF] hover:text-white text-[#052659] px-3 py-2 rounded-lg cursor-pointer"
                                        >
                                            <i className="ri-pencil-line text-base"></i>
                                            <span className="font-medium">Compose</span>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div
                                            key={folder}
                                            onClick={() => {
                                                setActiveFolder(folder);
                                                setSelectedMail(null);
                                                setIsComposing(false);
                                            }}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                  ${activeFolder === folder
                                                    ? "bg-[#5F81AF] text-white"
                                                    : "hover:bg-[#5F81AF] hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <i className={`${folderIcons[folder]} text-base`}></i>
                                                <span className="capitalize">{folder}</span>
                                            </div>

                                            {emailCount[folder] > 0 && (
                                                <span className="bg-white text-[#072A5A] text-xs px-2 rounded-full font-semibold">
                                                     {emailCount[folder]}
                                                </span>
                                            )}
                                        </div>
                                    );
                                }
                            })}
                        </nav>
                    </aside>

                    {/* ================= MAIL LIST ================= */}
                    {!isComposing && (
                        <section
                            className={`flex-1 border-r overflow-auto ${activeFolder === "drafts" ? "" : ""
                                }`}
                        >
                            <>
                                {/* Search */}
                                <div className="p-4 border-b">
                                    <div className="flex items-center max-w-xs bg-[#EEF8FF] px-3 py-2 rounded-lg">
                                        <i className="ri-search-line text-gray-600"></i>
                                        <input
                                            placeholder="Search Mail"
                                            className="ml-2 w-full bg-transparent outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Header */}
                                <div className="hidden md:grid grid-cols-12 font-semibold px-4 py-2 text-xs text-[#052659] border-b">
                                    <div className="col-span-3">Sender</div>
                                    <div className="col-span-6">Subject</div>
                                    <div className="col-span-3 text-right">Date</div>
                                </div>
                            </>

                            {/* Emails List */}
                            <div>
                                {userEmails?.emails.map((mail) => (
                                    <div
                                        key={mail.id}
                                        onClick={() => {
                                            if (activeFolder === "drafts") {
                                                setIsComposing(true);
                                                setComposeData({ subject: mail.subject, body: mail.body });
                                                setSelectedMail(null);
                                            } else {
                                                setSelectedMail(mail);
                                                setIsComposing(false);
                                            }
                                        }}
                                        className={`group px-4 py-3 cursor-pointer md:grid md:grid-cols-12 transition-colors
                ${selectedMail?._id === mail._id
                                                ? "bg-[#072A5A] text-white"
                                                : "bg-[#EEF8FF] hover:bg-[#072A5A] hover:text-white"
                                            }`}
                                    >
                                        <div className="md:col-span-3 font-medium text-xs truncate">{mail.to}</div>
                                        <div className="md:col-span-6">
                                            <div className="font-semibold text-xs">{mail.subject}</div>
                                            <div className="text-xs opacity-70 truncate">{mail.body}</div>
                                        </div>
                                        <div className="md:col-span-3 text-xs md:text-right opacity-70">{toUTCString(mail.sentAt)}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ================= COMPOSE / PREVIEW ================= */}
                    {isComposing ? (
                        <aside className="w-full bg-[#EEF8FF] p-4 rounded-r-2xl">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border h-full flex flex-col">

                                <h2 className="text-xl font-medium mb-4 text-center">
                                    {activeFolder === "drafts" ? "Edit Draft" : "Compose Mail"}
                                </h2>

                                {/* TO */}
                                <input
                                    type="email"
                                    placeholder="To"
                                    value={composeData.to}
                                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                                    className="w-full mb-3 px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none"
                                />

                                {/* CC/BCC toggles */}
                                {/* CC */}
                                {showComposeCc && (
                                    <input
                                        type="email"
                                        placeholder="Cc"
                                        value={composeData.cc}
                                        onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                                        className="w-full mb-3 px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none"
                                    />
                                )}

                                {/* BCC */}
                                {showComposeBcc && (
                                    <input
                                        type="email"
                                        placeholder="Bcc"
                                        value={composeData.bcc}
                                        onChange={(e) => setComposeData({ ...composeData, bcc: e.target.value })}
                                        className="w-full mb-3 px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none"
                                    />
                                )}

                                {/* Subject */}
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    value={composeData.subject}
                                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                                    className="w-full mb-3 px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none"
                                />

                                {/* Body */}
                                <textarea
                                    placeholder="Your Message..."
                                    rows={8}
                                    value={composeData.body}
                                    onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none resize-none flex-1"
                                />

                                {/* Actions */}
                                <div className="flex items-center gap-4 mt-4">
                                    <b>B</b>
                                    <i>I</i>
                                    <u>U</u>
                                    <button
                                        type="button"
                                        onClick={() => setShowComposeCc(!showComposeCc)}
                                        className="text-black hover:underline"
                                    >
                                        Cc
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowComposeBcc(!showComposeBcc)}
                                        className="text-black hover:underline"
                                    >
                                        Bcc
                                    </button>
                                </div>

                                <button className="w-full mt-6 py-3 bg-[#052659] text-white rounded-xl font-medium">
                                    Send
                                </button>
                            </div>
                        </aside>
                    ) : (
                        // Preview stays narrow
                        <aside className="w-[360px] bg-[#EEF8FF] p-4 rounded-r-2xl hidden lg:block">
                            {selectedMail ? (
                                <>
                                    <div className="relative flex flex-wrap justify-end gap-2 mb-4">
                                        <button
                                            onClick={() => {
                                                setReplyData({
                                                    to: selectedMail.to,
                                                    cc: "", // can be auto-filled if you store cc
                                                    bcc: "",
                                                    body: `\n\n--- Original Message ---\n${selectedMail.body}`,
                                                });
                                                setShowReply(true);
                                            }}
                                            className="flex items-center gap-1 bg-[#C1E8FF] px-3 py-1 rounded text-xs"
                                        >
                                            <i className="ri-reply-line"></i> Reply
                                        </button>
                                        {showReply && (
                                            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
                                                <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-lg max-h-[90vh] overflow-y-auto">

                                                    {/* Header */}
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="text-base sm:text-lg font-semibold">Reply</h3>
                                                        <button
                                                            onClick={() => {
                                                                setShowReply(false);
                                                                setShowReplyCc(false);
                                                                setShowReplyBcc(false);
                                                            }}
                                                            className="text-gray-500 text-xl"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    {/* TO */}
                                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border-b pb-2 mb-2 text-sm">
                                                        <span className="w-full sm:w-8 text-gray-500">To</span>

                                                        <input
                                                            type="email"
                                                            value={replyData.to}
                                                            onChange={(e) =>
                                                                setReplyData({ ...replyData, to: e.target.value })
                                                            }
                                                            className="flex-1 outline-none border sm:border-none rounded px-2 py-1"
                                                        />

                                                        {/* <div className="flex gap-2 text-xs">
                                                            <button
                                                                onClick={() => setShowReplyCc(!showReplyCc)}
                                                                className="text-blue-600"
                                                            >
                                                                Cc
                                                            </button>
                                                            <button
                                                                onClick={() => setShowReplyBcc(!showReplyBcc)}
                                                                className="text-blue-600"
                                                            >
                                                                Bcc
                                                            </button>
                                                        </div> */}
                                                    </div>

                                                    {/* CC */}
                                                    {showReplyCc && (
                                                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border-b pb-2 mb-2 text-sm">
                                                            <span className="w-full sm:w-8 text-gray-500">Cc</span>
                                                            <input
                                                                type="email"
                                                                value={replyData.cc}
                                                                onChange={(e) =>
                                                                    setReplyData({ ...replyData, cc: e.target.value })
                                                                }
                                                                className="flex-1 outline-none border sm:border-none rounded px-2 py-1"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* BCC */}
                                                    {showReplyBcc && (
                                                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border-b pb-2 mb-2 text-sm">
                                                            <span className="w-full sm:w-8 text-gray-500">Bcc</span>
                                                            <input
                                                                type="email"
                                                                value={replyData.bcc}
                                                                onChange={(e) =>
                                                                    setReplyData({ ...replyData, bcc: e.target.value })
                                                                }
                                                                className="flex-1 outline-none border sm:border-none rounded px-2 py-1"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* BODY */}
                                                    <textarea
                                                        value={replyData.body}
                                                        onChange={(e) =>
                                                            setReplyData({ ...replyData, body: e.target.value })
                                                        }
                                                        rows={6}
                                                        className="w-full border rounded p-2 text-sm resize-none mt-3"
                                                        placeholder="Write your reply..."
                                                    />

                                                    {/* ACTIONS */}
                                                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                                                        <button
                                                            onClick={() => setShowReply(false)}
                                                            className="px-4 py-2 text-sm rounded border w-full sm:w-auto"
                                                        >
                                                            Cancel
                                                        </button>

                                                        <button
                                                            onClick={onSubmit}
                                                            className="px-4 py-2 text-sm rounded bg-[#071a3d] text-white w-full sm:w-auto"
                                                        >
                                                            Send
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}



                                        {/* <button
                                            onClick={() => setShowForward(true)}
                                            className="flex items-center gap-1 bg-[#C1E8FF] px-3 py-1 rounded text-xs"
                                        >
                                            <i className="ri-share-forward-line"></i> Forward
                                        </button> */}
                                        {showForward && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                                <div className="bg-white w-full max-w-lg rounded-2xl p-5 shadow-lg">
                                                    {/* Header */}
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-lg font-semibold">Forward Email</h3>
                                                        <button
                                                            onClick={() => {
                                                                setShowForward(false);
                                                                setShowCc(false);
                                                                setShowBcc(false);
                                                            }}
                                                            className="text-gray-500 hover:text-black"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    {/* To Row */}
                                                    <div className="flex items-center gap-2 border-b pb-2 mb-3 text-sm">
                                                        <span className="w-8 text-gray-500">To</span>
                                                        <input
                                                            type="email"
                                                            value={forwardData.to}
                                                            onChange={(e) =>
                                                                setForwardData({ ...forwardData, to: e.target.value })
                                                            }
                                                            placeholder="recipient@example.com"
                                                            className="flex-1 outline-none"
                                                        />

                                                        <button
                                                            onClick={() => setShowCc(!showCc)}
                                                            className="text-xs text-blue-600"
                                                        >
                                                            Cc
                                                        </button>

                                                        <button
                                                            onClick={() => setShowBcc(!showBcc)}
                                                            className="text-xs text-blue-600"
                                                        >
                                                            Bcc
                                                        </button>
                                                    </div>

                                                    {/* CC */}
                                                    {showCc && (
                                                        <div className="flex items-center gap-2 border-b pb-2 mb-3 text-sm">
                                                            <span className="w-8 text-gray-500">Cc</span>
                                                            <input
                                                                type="email"
                                                                value={forwardData.cc}
                                                                onChange={(e) =>
                                                                    setForwardData({ ...forwardData, cc: e.target.value })
                                                                }
                                                                placeholder="cc@example.com"
                                                                className="flex-1 outline-none"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* BCC */}
                                                    {showBcc && (
                                                        <div className="flex items-center gap-2 border-b pb-2 mb-3 text-sm">
                                                            <span className="w-8 text-gray-500">Bcc</span>
                                                            <input
                                                                type="email"
                                                                value={forwardData.bcc}
                                                                onChange={(e) =>
                                                                    setForwardData({ ...forwardData, bcc: e.target.value })
                                                                }
                                                                placeholder="bcc@example.com"
                                                                className="flex-1 outline-none"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Body Preview (optional but realistic) */}
                                                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-3">
                                                        <strong>Forwarded message:</strong>
                                                        <p className="mt-1 whitespace-pre-line">
                                                            {selectedMail?.body}
                                                        </p>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex justify-end gap-2 mt-5">
                                                        <button
                                                            onClick={() => setShowForward(false)}
                                                            className="px-4 py-2 text-sm rounded border"
                                                        >
                                                            Cancel
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                console.log("Forward email:", forwardData);
                                                                setShowForward(false);
                                                            }}
                                                            className="px-4 py-2 text-sm rounded bg-[#071a3d] text-white"
                                                        >
                                                            Send
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}



                                        <button className="flex items-center gap-1 bg-[#C1E8FF] px-3 py-1 rounded text-xs"
                                            onClick={onDelete}>
                                            <i className="ri-delete-bin-line"></i> Delete
                                        </button>

                                        {/* 3 dots button */}
                                        <button
                                            onClick={() => setOpen(!open)}
                                            className="bg-[#C1E8FF] px-2 py-1 rounded text-xs"
                                        >
                                            <i className="ri-more-2-fill text-base"></i>
                                        </button>

                                        {/* Dropdown */}
                                        {open && (
                                            <div className="absolute right-0 top-9 w-40 bg-white border border-gray-200 rounded shadow-md z-50">
                                                <button
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                                    onClick={onUpdate}
                                                >
                                                    Mark as Discussion
                                                </button>
                                                {/* <button
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                                    onClick={() => {
                                                        setOpen(false);
                                                        // handle mark as ongoing here
                                                    }}
                                                >
                                                    Mark as Ongoing
                                                </button> */}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-sm space-y-2 border-y py-4">
                                        <p><strong>Subject:</strong> {selectedMail.subject}</p>
                                        <p><strong>From:</strong> {selectedMail.from}</p>
                                        <p><strong>To:</strong> {selectedMail.to}</p>
                                    </div>

                                    <div className="mt-4 whitespace-pre-line text-sm">{selectedMail.body}</div>
                                </>
                            ) : (
                                <p className="text-center text-sm text-gray-500 mt-10">Select an email</p>
                            )}
                        </aside>
                    )}

                </div>

            </div>

            {/* ================= SMALLER SCREENS VERSION ================= */}
            <div className="h-full w-full bg-[#EEF8FF] email-desktop-smaller-version mx-auto hidden">
                <div className="h-full bg-white rounded-2xl flex flex-col">

                    {/* ================= FOLDER NAVIGATION ================= */}
                    <aside className="w-full bg-[#072A5A] text-white p-4 flex flex-row overflow-x-auto gap-2">
                        {foldersList.map((folder) => {
                            if (folder === "compose") {
                                return (
                                    <div
                                        key="compose"
                                        onClick={() => {
                                            setIsComposing(true);
                                            setSelectedMail(null);
                                            setComposeData({ to: "", subject: "", body: "" });
                                            setActiveFolder("compose");
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm
                ${activeFolder === "compose" ? "bg-[#5F81AF]" : "hover:bg-[#5F81AF]"}`}
                                    >
                                        <i className="ri-pencil-line text-base"></i>
                                        <span>Compose</span>
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        key={folder}
                                        onClick={() => {
                                            setActiveFolder(folder);
                                            setSelectedMail(null);
                                            setIsComposing(false);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm
                ${activeFolder === folder ? "bg-[#5F81AF]" : "hover:bg-[#5F81AF]"}`}
                                    >
                                        <i className={`${folderIcons[folder]} text-base`}></i>
                                        <span className="capitalize">{folder}</span>
                                        {folders[folder]?.length > 0 && (
                                            <span className="bg-white text-[#072A5A] text-xs px-2 rounded-full font-semibold">
                                                {folders[folder].length}
                                            </span>
                                        )}
                                    </div>
                                );
                            }
                        })}
                    </aside>

                    {/* ================= MAIL LIST ================= */}
                    {!isComposing && activeFolder !== "compose" && selectedMail === null && (
                        <section className="w-full border-b overflow-auto">
                            {folders[activeFolder]?.map((mail) => (
                                <div
                                    key={mail.id}
                                    onClick={() => {
                                        if (activeFolder === "drafts") {
                                            setIsComposing(true);
                                            setComposeData({ subject: mail.subject, body: mail.body });
                                            setSelectedMail(null);
                                        } else {
                                            setIsComposing(false);
                                            setSelectedMail(mail); // show preview fullscreen
                                        }
                                    }}
                                    className="group px-4 py-3 cursor-pointer transition-colors bg-[#EEF8FF] hover:bg-[#072A5A] hover:text-white border-b border-[#5F81AF]"
                                >
                                    <div className="font-medium text-sm">{mail.sender}</div>
                                    <div className="font-semibold text-sm">{mail.subject}</div>
                                    <div className="text-xs opacity-70 truncate">{mail.preview}</div>
                                    <div className="text-xs opacity-70 text-right">{mail.date}</div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* ================= PREVIEW / COMPOSE FULL SCREEN ================= */}
                    {(isComposing || selectedMail) && (
                        <aside className="w-full bg-[#EEF8FF] p-4 flex-1">
                            <div className="flex items-center mb-4">
                                {/* Back Button: only for Sent, Inbox, Spam */}
                                {!isComposing && ["sent", "inbox", "spam"].includes(activeFolder) && (
                                    <button
                                        onClick={() => setSelectedMail(null)}
                                        className="flex items-center gap-1 text-[#072A5A] hover:text-[#052659] font-medium"
                                    >
                                        <i className="ri-arrow-left-line"></i> Back
                                    </button>
                                )}
                            </div>
                            {isComposing ? (
                                <div className="bg-white rounded-3xl p-6 shadow-sm border h-full flex flex-col">
                                    <h2 className="text-xl font-medium mb-4 text-center">
                                        {activeFolder === "drafts" ? "Edit Draft" : "Compose Mail"}
                                    </h2>

                                    <input
                                        type="email"
                                        placeholder="To"
                                        value={composeData.to}
                                        onChange={(e) =>
                                            setComposeData({ ...composeData, to: e.target.value })
                                        }
                                        className="w-full mb-3 px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none"
                                    />
                                    {/* CC/BCC toggles */}
                                    {/* CC */}
                                    {showComposeCc && (
                                        <input
                                            type="email"
                                            placeholder="Cc"
                                            value={composeData.cc}
                                            onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                                            className="w-full mb-3 px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none"
                                        />
                                    )}

                                    {/* BCC */}
                                    {showComposeBcc && (
                                        <input
                                            type="email"
                                            placeholder="Bcc"
                                            value={composeData.bcc}
                                            onChange={(e) => setComposeData({ ...composeData, bcc: e.target.value })}
                                            className="w-full mb-3 px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none"
                                        />
                                    )}
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        value={composeData.subject}
                                        onChange={(e) =>
                                            setComposeData({ ...composeData, subject: e.target.value })
                                        }
                                        className="w-full mb-3 px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none"
                                    />

                                    <textarea
                                        placeholder="Your Message..."
                                        rows={8}
                                        value={composeData.body}
                                        onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none resize-none flex-1"
                                    />

                                    <div className="flex items-center gap-4 mt-4">
                                        <b>B</b>
                                        <i>I</i>
                                        <u>U</u>
                                        <button
                                            type="button"
                                            onClick={() => setShowComposeCc(!showComposeCc)}
                                            className="text-black hover:underline"
                                        >
                                            Cc
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowComposeBcc(!showComposeBcc)}
                                            className="text-black hover:underline"
                                        >
                                            Bcc
                                        </button>
                                    </div>

                                    <button className="w-full mt-6 py-3 bg-[#052659] text-white rounded-xl font-medium">
                                        Send
                                    </button>
                                </div>
                            ) : (
                                <div className="relative bg-white rounded-3xl p-6 shadow-sm border h-full flex flex-col">
                                    <div className="relative flex flex-wrap justify-end gap-2 mb-4">
                                        <button
                                            onClick={() => {
                                                setReplyData({
                                                    to: selectedMail.to,
                                                    cc: "",
                                                    bcc: "",
                                                    body: `\n\n--- Original Message ---\n${selectedMail.body}`,
                                                });
                                                setShowReply(true);
                                            }}
                                            className="flex items-center gap-1 bg-[#C1E8FF] px-3 py-1 rounded text-xs"
                                        >
                                            <i className="ri-reply-line"></i> Reply
                                        </button>

                                        {showReply && (
                                            <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-end sm:items-center">
                                                <div className="
      bg-white
      w-full
      sm:max-w-lg
      rounded-t-2xl sm:rounded-2xl
      p-4 sm:p-5
      max-h-[90vh]
      overflow-y-auto
    ">

                                                    {/* Header */}
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="text-base sm:text-lg font-semibold">Reply</h3>
                                                        <button
                                                            onClick={() => {
                                                                setShowReply(false);
                                                                setShowReplyCc(false);
                                                                setShowReplyBcc(false);
                                                            }}
                                                            className="text-xl text-gray-500"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    {/* TO */}
                                                    <div className="border-b pb-2 mb-2 text-sm">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                            <span className="text-gray-500 sm:w-8">To</span>

                                                            <input
                                                                type="email"
                                                                value={replyData.to}
                                                                onChange={(e) =>
                                                                    setReplyData({ ...replyData, to: e.target.value })
                                                                }
                                                                className="flex-1 border sm:border-none rounded px-2 py-1 outline-none"
                                                            />

                                                            {/* <div className="flex gap-3 text-xs sm:ml-auto">
                                                                <button
                                                                    onClick={() => setShowReplyCc(!showReplyCc)}
                                                                    className="text-blue-600"
                                                                >
                                                                    Cc
                                                                </button>
                                                                <button
                                                                    onClick={() => setShowReplyBcc(!showReplyBcc)}
                                                                    className="text-blue-600"
                                                                >
                                                                    Bcc
                                                                </button>
                                                            </div> */}
                                                        </div>
                                                    </div>

                                                    {/* CC */}
                                                    {showReplyCc && (
                                                        <div className="border-b pb-2 mb-2 text-sm">
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                                <span className="text-gray-500 sm:w-8">Cc</span>
                                                                <input
                                                                    type="email"
                                                                    value={replyData.cc}
                                                                    onChange={(e) =>
                                                                        setReplyData({ ...replyData, cc: e.target.value })
                                                                    }
                                                                    className="flex-1 border sm:border-none rounded px-2 py-1 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* BCC */}
                                                    {showReplyBcc && (
                                                        <div className="border-b pb-2 mb-2 text-sm">
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                                <span className="text-gray-500 sm:w-8">Bcc</span>
                                                                <input
                                                                    type="email"
                                                                    value={replyData.bcc}
                                                                    onChange={(e) =>
                                                                        setReplyData({ ...replyData, bcc: e.target.value })
                                                                    }
                                                                    className="flex-1 border sm:border-none rounded px-2 py-1 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* BODY */}
                                                    <textarea
                                                        rows={6}
                                                        value={replyData.body}
                                                        onChange={(e) =>
                                                            setReplyData({ ...replyData, body: e.target.value })
                                                        }
                                                        placeholder="Write your reply…"
                                                        className="w-full border rounded p-2 text-sm resize-none mt-3"
                                                    />

                                                    {/* ACTIONS */}
                                                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                                                        <button
                                                            onClick={() => setShowReply(false)}
                                                            className="w-full sm:w-auto px-4 py-2 text-sm rounded border"
                                                        >
                                                            Cancel
                                                        </button>

                                                        <button
                                                            onClick={onSubmit}
                                                            className="w-full sm:w-auto px-4 py-2 text-sm rounded bg-[#071a3d] text-white"
                                                        >
                                                            Send
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}


                                        <button
                                            onClick={() => setShowForward(true)}
                                            className="flex items-center gap-1 bg-[#C1E8FF] px-3 py-1 rounded text-xs"
                                        >
                                            <i className="ri-share-forward-line"></i> Forward
                                        </button>

                                        {showForward && (
                                            <div className="fixed inset-0 z-50 flex flex-wrap items-end sm:items-center justify-center bg-black/40">
                                                <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-lg max-h-[90vh] overflow-y-auto">

                                                    {/* Header */}
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="text-base sm:text-lg font-semibold">
                                                            Forward Email
                                                        </h3>
                                                        <button
                                                            onClick={() => {
                                                                setShowForward(false);
                                                                setShowCc(false);
                                                                setShowBcc(false);
                                                            }}
                                                            className="text-gray-500 text-xl"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    {/* TO */}
                                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border-b pb-2 mb-2 text-sm">
                                                        <span className="w-full sm:w-8 text-gray-500">To</span>

                                                        <input
                                                            type="email"
                                                            value={forwardData.to}
                                                            onChange={(e) =>
                                                                setForwardData({ ...forwardData, to: e.target.value })
                                                            }
                                                            placeholder="recipient@example.com"
                                                            className="flex-1 min-w-0 outline-none border sm:border-none rounded px-2 py-1"
                                                        />

                                                        <div className="flex gap-2 text-xs">
                                                            <button
                                                                onClick={() => setShowCc(!showCc)}
                                                                className="text-blue-600"
                                                            >
                                                                Cc
                                                            </button>
                                                            <button
                                                                onClick={() => setShowBcc(!showBcc)}
                                                                className="text-blue-600"
                                                            >
                                                                Bcc
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* CC */}
                                                    {showCc && (
                                                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border-b pb-2 mb-2 text-sm">
                                                            <span className="w-full sm:w-8 text-gray-500">Cc</span>
                                                            <input
                                                                type="email"
                                                                value={forwardData.cc}
                                                                onChange={(e) =>
                                                                    setForwardData({ ...forwardData, cc: e.target.value })
                                                                }
                                                                placeholder="cc@example.com"
                                                                className="flex-1 outline-none border sm:border-none rounded px-2 py-1"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* BCC */}
                                                    {showBcc && (
                                                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border-b pb-2 mb-2 text-sm">
                                                            <span className="w-full sm:w-8 text-gray-500">Bcc</span>
                                                            <input
                                                                type="email"
                                                                value={forwardData.bcc}
                                                                onChange={(e) =>
                                                                    setForwardData({ ...forwardData, bcc: e.target.value })
                                                                }
                                                                placeholder="bcc@example.com"
                                                                className="flex-1 outline-none border sm:border-none rounded px-2 py-1"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* BODY PREVIEW */}
                                                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-3">
                                                        <strong>Forwarded message:</strong>
                                                        <p className="mt-1 whitespace-pre-line">
                                                            {selectedMail?.body}
                                                        </p>
                                                    </div>

                                                    {/* ACTIONS */}
                                                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                                                        <button
                                                            onClick={() => setShowForward(false)}
                                                            className="px-4 py-2 text-sm rounded border w-full sm:w-auto"
                                                        >
                                                            Cancel
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                console.log("Forward email:", forwardData);
                                                                setShowForward(false);
                                                            }}
                                                            className="px-4 py-2 text-sm rounded bg-[#071a3d] text-white w-full sm:w-auto"
                                                        >
                                                            Send
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}


                                        <button className="flex items-center gap-1 bg-[#C1E8FF] px-3 py-1 rounded text-xs"
                                            onClick={onDelete}
                                        >
                                            <i className="ri-delete-bin-line"></i> Delete
                                        </button>
                                        <button
                                            onClick={() => setOpen(!open)}
                                            className="bg-[#C1E8FF] px-2 py-1 rounded text-xs"
                                        >
                                            <i className="ri-more-2-fill text-base"></i>
                                        </button>

                                        {open && (
                                            <div className="absolute right-0 mt-9 mr-9 w-40 bg-white border border-gray-200 rounded shadow-md z-50">
                                                <button
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                                    onClick={onUpdate}
                                                >
                                                    Mark as Discussion
                                                </button>
                                                {/* <button
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                                    onClick={() => {
                                                        setOpen(false);
                                                    }}
                                                >
                                                    Mark as Ongoing
                                                </button> */}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-sm space-y-2 border-y py-4">
                                        <p><strong>Subject:</strong> {selectedMail.subject}</p>
                                        <p><strong>From:</strong> {selectedMail.from}</p>
                                        <p><strong>To:</strong> {selectedMail.to}</p>
                                    </div>

                                    <div className="mt-4 whitespace-pre-line text-sm">{selectedMail.body}</div>
                                </div>
                            )}
                        </aside>
                    )}
                </div>
            </div>


        </div>
    )
}

export default Dashboardemail