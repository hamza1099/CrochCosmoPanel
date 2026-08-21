import React, { useState } from "react";
import { MasterclassRequest, saveMasterclassRequestToDB, deleteMasterclassRequestFromDB } from "../firebase";

interface MasterclassRequestsPageProps {
  requests: MasterclassRequest[];
}

export const MasterclassRequestsPage: React.FC<MasterclassRequestsPageProps> = ({ requests }) => {
  const [filter, setFilter] = useState("All");

  const filteredRequests = requests.filter((req) => {
    if (filter === "All") return true;
    return req.status === filter;
  });

  const handleStatusChange = async (request: MasterclassRequest, newStatus: string) => {
    const updated = { ...request, status: newStatus as any };
    await saveMasterclassRequestToDB(updated);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this masterclass request?")) {
      await deleteMasterclassRequestFromDB(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-body">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[#1b1c1a]">Masterclass Requests</h1>
          <p className="text-sm text-[#76786f] mt-1">Manage 1-on-1 artisan teaching sessions</p>
        </div>
        <div className="flex gap-2">
          {["All", "New", "In Review", "Confirmed", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                filter === status
                  ? "bg-[#585e4c] text-white shadow-md"
                  : "bg-white text-[#585e4c] border border-[#e4e2de] hover:bg-[#efeeea]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#e4e2de]">
            <span className="material-symbols-outlined text-4xl text-[#c7c7bd] mb-3">school</span>
            <h3 className="text-xl font-display font-medium text-[#464840]">No Requests Found</h3>
            <p className="text-sm text-[#76786f]">There are no masterclass requests matching this status.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#e4e2de] flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-display font-semibold text-[#1b1c1a]">{req.userName}</h3>
                    <div className="text-sm text-[#76786f] space-x-3 mt-1">
                      <span><span className="material-symbols-outlined text-xs align-middle">call</span> {req.userPhone}</span>
                      {req.userEmail && <span><span className="material-symbols-outlined text-xs align-middle">mail</span> {req.userEmail}</span>}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    req.status === "New" ? "bg-blue-100 text-blue-700" :
                    req.status === "Confirmed" ? "bg-green-100 text-green-700" :
                    req.status === "Completed" ? "bg-gray-100 text-gray-700" :
                    req.status === "Cancelled" ? "bg-red-100 text-red-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#f5f3ef] p-4 rounded-xl">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#585e4c] mb-1">Requested Date</p>
                    <p className="text-sm font-medium text-[#1b1c1a]">{new Date(req.requestedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#585e4c] mb-1">Skill Level</p>
                    <p className="text-sm font-medium text-[#1b1c1a]">{req.skillLevel}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#585e4c] mb-1">Learning Goals & Queries</p>
                  <p className="text-sm text-[#464840] leading-relaxed bg-[#f8f7f4] p-4 rounded-xl border border-[#e4e2de]">
                    {req.goals}
                  </p>
                </div>
              </div>

              <div className="md:w-64 flex flex-col gap-3 justify-end border-t md:border-t-0 md:border-l border-[#e4e2de] pt-4 md:pt-0 md:pl-6">
                <p className="text-xs font-bold text-center uppercase tracking-wider text-[#76786f] mb-1">Update Status</p>
                <select 
                  value={req.status}
                  onChange={(e) => handleStatusChange(req, e.target.value)}
                  className="w-full bg-white border border-[#c7c7bd] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#8e4d31] font-medium"
                >
                  <option value="New">New</option>
                  <option value="In Review">In Review</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                
                <a 
                  href={`https://wa.me/${req.userPhone.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold uppercase tracking-widest text-center transition-colors border border-green-200 mt-2"
                >
                  WhatsApp Contact
                </a>

                <button
                  onClick={() => handleDelete(req.id)}
                  className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors mt-auto"
                >
                  Delete Request
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
