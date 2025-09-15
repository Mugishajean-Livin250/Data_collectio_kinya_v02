// src/pages/DashboardAdmin.tsx
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";
import {
  getAllAssignedAudios,
  downloadAudioUrl,
  forceTranscription,
  reviewTranscription,
  getAudioQualityReport,
  createUser,
  assignAudio,
} from "../features/admin/adminAPI";
import type { AudioItem } from "../features/admin/adminAPI";

const Sidebar: React.FC<{ onCreateUser: () => void; onAssignAudio: () => void }> = ({ onCreateUser, onAssignAudio }) => {
  return (
    <aside className="w-72 bg-neutral-800 text-white min-h-screen p-4 flex flex-col gap-4">
      <nav className="grid gap-2">
        <button className="text-left px-3 py-2 rounded hover:bg-neutral-700">Dashboard</button>
        <button className="text-left px-3 py-2 rounded hover:bg-neutral-700" onClick={onCreateUser}>Create User</button>
        <button className="text-left px-3 py-2 rounded hover:bg-neutral-700" onClick={onAssignAudio}>Assign Audio</button>
        <a href="/#" className="text-left px-3 py-2 rounded hover:bg-neutral-700">Reports</a>
      </nav>
      <div className="mt-auto text-sm text-neutral-300">Logged as Admin</div>
    </aside>
  );
};

const SmallCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div className="bg-neutral-800 p-4 rounded-2xl shadow-sm">
    <div className="text-sm text-neutral-400">{title}</div>
    <div className="text-xl font-semibold text-white">{value}</div>
  </div>
);

const DashboardAdmin: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioItem | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showAssignAudio, setShowAssignAudio] = useState(false);

  // create user form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("transcriber");

  // assign audio form
  const [topic, setTopic] = useState("");
  const [collectorId, setCollectorId] = useState<number | null>(null);
  const [transcriberId, setTranscriberId] = useState<number | null>(null);
  const [validatorId, setValidatorId] = useState<number | null>(null);

  async function loadAudios() {
    setLoading(true);
    try {
      const list = await getAllAssignedAudios(token);
      setAudios(list);
    } catch (e: any) {
      alert("Failed to load audios: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAudios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleForceTranscription(id: number) {
    const ok = confirm("Force AI transcription for this audio? This will call AI and update the record.");
    if (!ok) return;
    try {
      const res = await forceTranscription(id, token);
      alert(res.msg || "Force transcription requested");
      loadAudios();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function handleReview(id: number, approve: boolean) {
    const confirmMsg = approve ? "Approve this transcription?" : "Reject this transcription?";
    if (!confirm(confirmMsg)) return;
    try {
      await reviewTranscription(id, approve, token);
      alert(`Transcription ${approve ? "approved" : "rejected"}`);
      loadAudios();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function handleQualityReport(id: number) {
    try {
      const rpt = await getAudioQualityReport(id, token);
      alert(JSON.stringify(rpt, null, 2));
    } catch (e: any) {
      alert("Error getting report: " + e.message);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createUser(newUsername, newPassword, newRole, token);
      alert("User created");
      setShowCreateUser(false);
      setNewUsername("");
      setNewPassword("");
    } catch (err: any) {
      alert("Create user failed: " + err.message);
    }
  }

  async function handleAssignAudio(e: React.FormEvent) {
    e.preventDefault();
    if (!collectorId || !transcriberId) {
      alert("Collector and transcriber IDs are required");
      return;
    }
    try {
      await assignAudio(topic, collectorId, transcriberId, validatorId ?? null, token);
      alert("Audio assigned");
      setShowAssignAudio(false);
      setTopic("");
      setCollectorId(null);
      setTranscriberId(null);
      setValidatorId(null);
      loadAudios();
    } catch (err: any) {
      alert("Assign failed: " + err.message);
    }
  }

  return (
    <div className="flex">
      <Sidebar onCreateUser={() => setShowCreateUser(true)} onAssignAudio={() => setShowAssignAudio(true)} />

      <div className="flex-1 bg-neutral-900 min-h-screen p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
            <p className="text-neutral-400">Manage audios, users and reviews</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(logout())}
              className="rounded-2xl px-4 py-2 bg-white text-black font-medium hover:bg-neutral-200"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-4 mb-6">
          <SmallCard title="Total audios" value={audios.length} />
          <SmallCard title="Pending" value={audios.filter(a => a.status === "pending").length} />
          <SmallCard title="Ready for review" value={audios.filter(a => a.status === "ready_for_review" || a.status === "ready_for_validation").length} />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Assigned Audios</h2>
            <div className="flex gap-2">
              <button onClick={loadAudios} className="px-3 py-1 rounded bg-neutral-700 text-white">Refresh</button>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-neutral-400">Loading...</div>
            ) : audios.length === 0 ? (
              <div className="text-neutral-400">No audios found.</div>
            ) : (
              audios.map((audio) => (
                <div key={audio.id} className="bg-neutral-800 p-4 rounded-lg flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white">{audio.topic || `Audio #${audio.id}`}</div>
                        <div className="text-sm text-neutral-400">{audio.filename}</div>
                      </div>
                      <div className="text-sm text-neutral-300">{new Date(audio.created_at).toLocaleString()}</div>
                    </div>

                    <div className="mt-2 text-sm text-neutral-300 flex gap-4 items-center">
                      <div>Status: <span className="ml-1 font-medium text-white">{audio.status}</span></div>
                      <div>Duration: <span className="ml-1">{audio.duration ?? "—"}s</span></div>
                      <div>AI: <span className="ml-1">{audio.ai_transcription ? "Yes" : "No"}</span></div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      {audio.download_url ? (
                        <a
                          className="px-3 py-1 rounded bg-white text-black text-sm"
                          href={downloadAudioUrl(audio.id)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      ) : (
                        <button className="px-3 py-1 rounded bg-neutral-700 text-white text-sm" disabled>
                          No file
                        </button>
                      )}

                      <button
                        onClick={() => { setSelectedAudio(audio); handleForceTranscription(audio.id); }}
                        className="px-3 py-1 rounded bg-amber-600 text-black text-sm"
                      >
                        Force AI
                      </button>

                      <button
                        onClick={() => handleQualityReport(audio.id)}
                        className="px-3 py-1 rounded bg-neutral-700 text-white text-sm"
                      >
                        Quality
                      </button>

                      <button
                        onClick={() => handleReview(audio.id, true)}
                        className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(audio.id, false)}
                        className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                      >
                        Reject
                      </button>
                    </div>

                    {selectedAudio?.id === audio.id && audio.ai_transcription && (
                      <div className="mt-3 bg-neutral-700 p-3 rounded text-sm text-neutral-200">
                        <div className="font-semibold">AI Transcript (Kinyarwanda)</div>
                        <div className="mt-1">{audio.ai_transcription}</div>
                        {audio.ai_transcription_english && (
                          <>
                            <div className="font-semibold mt-2">AI Translation (English)</div>
                            <div className="mt-1">{audio.ai_transcription_english}</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateUser} className="w-full max-w-lg bg-neutral-900 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create User</h3>
            <div className="grid grid-cols-1 gap-3">
              <input className="p-3 rounded bg-neutral-800 text-white" placeholder="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
              <input className="p-3 rounded bg-neutral-800 text-white" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <select className="p-3 rounded bg-neutral-800 text-white" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="transcriber">transcriber</option>
                <option value="datacollector">datacollector</option>
                <option value="validator">validator</option>
                <option value="admin">admin</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreateUser(false)} className="px-4 py-2 rounded bg-neutral-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-white text-black">Create</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Assign Audio Modal */}
      {showAssignAudio && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAssignAudio} className="w-full max-w-lg bg-neutral-900 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Assign Audio</h3>
            <div className="grid grid-cols-1 gap-3">
              <input className="p-3 rounded bg-neutral-800 text-white" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} required />
              <input type="number" className="p-3 rounded bg-neutral-800 text-white" placeholder="Collector ID" value={collectorId ?? ""} onChange={(e) => setCollectorId(Number(e.target.value))} required />
              <input type="number" className="p-3 rounded bg-neutral-800 text-white" placeholder="Transcriber ID" value={transcriberId ?? ""} onChange={(e) => setTranscriberId(Number(e.target.value))} required />
              <input type="number" className="p-3 rounded bg-neutral-800 text-white" placeholder="Validator ID (optional)" value={validatorId ?? ""} onChange={(e) => setValidatorId(e.target.value ? Number(e.target.value) : null)} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAssignAudio(false)} className="px-4 py-2 rounded bg-neutral-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-white text-black">Assign</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;
