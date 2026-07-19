import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { aiEmailAssist, JobLeads, sendEmails } from '../../Redux/Features/UserDetailSlice';

export const SearchLeadsModal = ({ isOpen, onClose, onSubmit }) => {
  const [keyword, setKeyword] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { loading, error } = useSelector(
    (state) => state.userDetail
  );

  if (!isOpen) return null;

  const togglePlatform = (platform) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ keyword, platforms, dateFrom, dateTo });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Search Leads</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Keyword */}
          <div>
            <label className="mb-1 block text-sm font-medium">Keyword</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Web Developer"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Platforms */}
          <div>
            <label className="mb-2 block text-sm font-medium">Platforms</label>
            <div className="flex gap-3">
              {[ 'Google', 'LinkedIn', 'Upwork', 'Twitter', 'Facebook'].map((platform) => (
                <button
                  type="button"
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`rounded-lg border px-3 py-1 text-sm transition ${platforms.includes(platform)
                    ? 'bg-[#052659] text-white'
                    : 'bg-white text-gray-700'
                    }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#052659] px-4 py-2 text-white hover:underline"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search Leads"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const FollowTrackModal = ({ onClose, leadIds }) => {
  const { loading, error } = useSelector(
    (state) => state.userDetail
  );
  const dispatch = useDispatch();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const editorRef = useRef(null);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState("rewrite");



  const formatText = (command) => {
    document.execCommand(command, false, null);
  };


  // Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };



  const handleSend = async () => {
    await dispatch(sendEmails({
      subject,
      body,
      attachments,
      leadIds,
    }));

    dispatch(JobLeads());

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-white p-6 shadow-xl overflow-auto">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">COMPOSE MAIL</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-sm border h-fit">
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
              // dangerouslySetInnerHTML={{ __html: body }}
              suppressContentEditableWarning
              className="w-full px-4 py-3 bg-[#EEF8FF] rounded-xl outline-none resize-none min-h-[180px]"
              onInput={(e) => setBody(e.currentTarget.innerHTML)}
            ></div>

            {/* Formatting buttons */}
            <div className="flex items-center gap-4 mt-4 text-gray-700 px-2">
              <button
                type="button"
                onClick={() => formatText("bold")}
                className="font-bold"
              >
                B
              </button>

              <button
                type="button"
                onClick={() => formatText("italic")}
                className="italic"
              >
                I
              </button>

              <button
                type="button"
                onClick={() => formatText("underline")}
                className="underline"
              >
                U
              </button>
              <i className="ri-list-unordered"></i>
              <i className="ri-list-ordered"></i>
              <span className=" text-gray-700">Cc Bcc</span>
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
              <button
                type="button"
                className="text-blue-600 hover:underline mt-1"
              >
                browse files
              </button>
              <input type="file" multiple onChange={handleFileInput} className="ml-2" style={{ position: 'relative', bottom: '25px', opacity: 0, }} />
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((file, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-200 rounded">{file.name}</span>
              ))}
            </div>


            {/* Send Button */}
            <button
              onClick={handleSend}
              className="w-full mt-6 py-3 bg-[#052659] text-white rounded-xl font-medium hover:bg-blue-800">
              {loading ? "Sending..." : "Send to all Interested"}
            </button>
          </div>
        </div>
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

  );
};


export const Ai_Assists = ({ aiMode, setAiMode, setAiPrompt, aiPrompt, setBody, setSubject, setShowAI, body, editorRef }) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const res = await dispatch(
        aiEmailAssist({
          mode: aiMode,
          body,
          prompt: aiPrompt,
        })
      ).unwrap();

      if (res.subject) setSubject(res.subject);

      if (res.body && editorRef.current) {
        editorRef.current.innerHTML = res.body;
        setBody(res.body);
      }

      setShowAI(false);
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">COMPOSE MAIL</h2>
          <button onClick={() => setShowAI(false)} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="mt-4 bg-gray-100 p-4 rounded-xl">
          <select
            value={aiMode}
            onChange={(e) => setAiMode(e.target.value)}
            className="mb-2 w-full p-2 rounded"
          >
            <option value="rewrite">Rewrite existing email</option>
            <option value="generate">Generate new email</option>
          </select>

          <textarea
            placeholder="Enter instruction or prompt..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full p-2 rounded mb-2"
          />

          <button
            // onClick={async () => {
            //   const res = await dispatch(
            //     aiEmailAssist({
            //       mode: aiMode,
            //       body,
            //       prompt: aiPrompt,
            //     })
            //   ).unwrap();

            //   if (res.subject) setSubject(res.subject);
            //   if (res.body && editorRef.current) {
            //     editorRef.current.innerHTML = res.body;
            //     setBody(res.body);
            //   }

            //   setShowAI(false);
            // }}
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-[#052659] text-white py-2 rounded"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  )
}
