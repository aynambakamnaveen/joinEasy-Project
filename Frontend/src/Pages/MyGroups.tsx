import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
    Users,
    Search,
    GraduationCap,
    Crown,
    BellRing,
    MoreVertical,
    UsersRound,
    X,
    Mail,
} from "lucide-react";
import { useAppContext } from "../Context/UserContext";
import api from "../api/axios";

const MyGroups = () => {
    const { user, loggedIn, loading, teacherGroups } = useAppContext();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [sendingAlert, setSendingAlert] = useState(false);

    const groups = useMemo(
        () => teacherGroups || [],
        [teacherGroups]
    );

    useEffect(() => {
        if (!loading && !loggedIn) {
            toast.error("Please login to continue");
            navigate("/login");
        }
    }, [loading, loggedIn, navigate]);

    const filteredGroups = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return groups;

        return groups.filter((group: any) =>
            group.name?.toLowerCase().includes(query) ||
            group.members?.some((member: any) =>
                member.username?.toLowerCase().includes(query) ||
                member.email?.toLowerCase().includes(query)
            )
        );
    }, [groups, search]);

    const totalStudents = groups.reduce(
        (total: number, group: any) =>
            total + (group.members?.length || 0),
        0
    );

    const assignedGroups = groups.filter(
        (group: any) => group.AssignTask
    ).length;

    const findLeader = (group: any) => {
        return group?.members?.find(
            (member: any) =>
                String(member._id) === String(group.leader)
        );
    };

    const sendAlertMail = async () => {
        if (!message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        const leader = findLeader(selectedGroup);

        if (!leader?.email) {
            toast.error("Group leader email not found");
            return;
        }

        if (!user?.username) {
            toast.error("Teacher username not found");
            return;
        }

        const dueDate =
            selectedGroup?.assignment?.dueDate ||
            selectedGroup?.dueDate;

        if (!dueDate || isNaN(new Date(dueDate).getTime())) {
            toast.error("Assignment due date not found");
            return;
        }

        try {
            setSendingAlert(true);

            await api.post("/sendAlertMail", {
                email: leader.email,
                teacherName: user.username,
                dueDate: new Date(dueDate).toISOString(),
                message: message.trim(),
            });

            toast.success("Alert sent successfully");
            setMessage("");
            document.getElementById("sendAlert")?.close();
        } catch (error) {
            console.error(error);
            toast.error("Failed to send alert");
        } finally {
            setSendingAlert(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0b0d12]">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-violet-400" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0b0d12] text-slate-100">

            {/* Header */}
            <header className="border-b border-white/[0.07]">
                <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">Teacher Portal</h2>
                            <p className="text-xs text-slate-500">Group management</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {user?.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt="Teacher"
                                className="size-9 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex size-9 items-center justify-center rounded-full bg-[#242332] text-violet-200">
                                {user?.username?.charAt(0)?.toUpperCase() || "T"}
                            </div>
                        )}

                        <div className="hidden sm:block">
                            <p className="text-sm font-medium">
                                {user?.username || "Teacher"}
                            </p>
                            <p className="text-xs text-slate-500">
                                Teacher account
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-6 lg:px-8">

                {/* Heading */}
                <section>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                        Workspace
                    </p>
                    <h1 className="text-2xl font-semibold sm:text-3xl">
                        My Groups
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Manage your teams, view students and communicate with group leaders.
                    </p>
                </section>

                {/* Summary */}
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        {
                            label: "Total groups",
                            count: groups.length,
                            icon: Users,
                            color: "text-violet-300",
                        },
                        {
                            label: "Total students",
                            count: totalStudents,
                            icon: GraduationCap,
                            color: "text-emerald-300",
                        },
                        {
                            label: "Assigned groups",
                            count: assignedGroups,
                            icon: UsersRound,
                            color: "text-blue-300",
                        },
                    ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.label}
                                className="rounded-xl border border-white/[0.07] bg-[#11141c] p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">
                                        {item.label}
                                    </span>
                                    <Icon size={19} className={item.color} />
                                </div>
                                <p className="mt-3 text-2xl font-semibold">
                                    {item.count}
                                </p>
                            </div>
                        );
                    })}
                </section>

                {/* Groups */}
                <section className="overflow-visible rounded-xl border border-white/[0.07] bg-[#11141c]">

                    <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                            <h2 className="font-semibold">Group directory</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {filteredGroups.length} groups found
                            </p>
                        </div>

                        <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-white/[0.09] bg-[#0b0d12] px-3 sm:max-w-xs">
                            <Search size={16} className="text-slate-500" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search groups or students..."
                                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-600"
                            />
                        </label>
                    </div>

                    {filteredGroups.length > 0 ? (
                        <div className="divide-y divide-white/[0.06]">
                            {filteredGroups.map((group: any) => {
                                const leader = findLeader(group);

                                return (
                                    <article
                                        key={group._id}
                                        className="flex flex-col gap-4 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:px-5"
                                    >
                                        {/* Group info */}
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                                                <Users size={19} />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-semibold">
                                                    {group.name || "Unnamed group"}
                                                </h3>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {group.members?.length ?? 0} students
                                                </p>
                                            </div>
                                        </div>

                                        {/* Leader */}
                                        <div className="text-xs text-slate-400">
                                            <span className="text-slate-500">Leader: </span>
                                            <span className="font-medium text-blue-400">
                                                {leader?.username || "Not found"}
                                            </span>
                                        </div>

                                        {/* Assignment status */}
                                        <span
                                            className={`w-fit rounded-full border px-3 py-1 text-xs ${
                                                group.AssignTask
                                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                                    : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                            }`}
                                        >
                                            {group.AssignTask ? "Assigned" : "Pending"}
                                        </span>

                                        {/* Actions */}
                                        <div className="dropdown dropdown-end">
                                            <button
                                                type="button"
                                                tabIndex={0}
                                                aria-label="Group actions"
                                                className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            <ul
                                                tabIndex={0}
                                                className="dropdown-content menu z-50 w-48 rounded-lg border border-slate-700 bg-[#171e2b] p-1 text-slate-200 shadow-lg"
                                            >
                                                <li>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedGroup(group);
                                                            document.getElementById("studentDetails")?.showModal();
                                                        }}
                                                    >
                                                        <Users size={16} />
                                                        View students ({group.members?.length ?? 0})
                                                    </button>
                                                </li>

                                                {group.AssignTask && (
                                                    <li>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedGroup(group);
                                                                setMessage("");
                                                                document.getElementById("sendAlert")?.showModal();
                                                            }}
                                                        >
                                                            <BellRing size={16} />
                                                            Send alert
                                                        </button>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center px-5 py-16 text-center">
                            <Users size={28} className="text-slate-500" />
                            <h3 className="mt-3 font-medium">
                                {search ? "No matching groups" : "No groups found"}
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                {search
                                    ? "Try searching with another name or email."
                                    : "Your groups will appear here once they are created."}
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* Student details modal */}
            <dialog id="studentDetails" className="modal">
                <div className="modal-box w-11/12 max-w-xl border border-slate-700 bg-[#11141c] p-0 text-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-800 p-5">
                        <div>
                            <h3 className="text-lg font-semibold">Group Members</h3>
                            <p className="mt-1 text-sm text-slate-400">
                                {selectedGroup?.name} · {selectedGroup?.members?.length ?? 0} members
                            </p>
                        </div>
                        <Users size={22} className="text-violet-300" />
                    </div>

                    <div className="max-h-[55vh] overflow-y-auto p-4">
                        {selectedGroup?.members?.length > 0 ? (
                            <ul className="space-y-2">
                                {selectedGroup.members.map((member: any) => {
                                    const isLeader =
                                        String(selectedGroup.leader) === String(member._id);

                                    return (
                                        <li
                                            key={member._id}
                                            className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#171e2b] p-3"
                                        >
                                            <img
                                                src={
                                                    member.ProfileImage ||
                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(member.username || "Student")}`
                                                }
                                                alt={member.username || "Student"}
                                                className="size-11 rounded-lg object-cover"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-semibold">
                                                        {member.username || "Unknown user"}
                                                    </span>

                                                    {isLeader && (
                                                        <span className="badge badge-sm badge-primary gap-1">
                                                            <Crown size={12} />
                                                            Leader
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 break-all text-xs text-slate-400">
                                                    {member.email || "No email available"}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="py-8 text-center text-sm text-slate-400">
                                No members found.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end border-t border-slate-800 p-4">
                        <form method="dialog">
                            <button className="rounded-lg border border-slate-700 px-5 py-2 text-sm hover:bg-slate-800">
                                Close
                            </button>
                        </form>
                    </div>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button>Close</button>
                </form>
            </dialog>

            {/* Send alert modal */}
            <dialog id="sendAlert" className="modal">
                <div className="modal-box w-11/12 max-w-lg border border-slate-700 bg-[#11141c] p-0 text-slate-100">
                    <div className="flex items-center gap-3 border-b border-slate-800 p-5">
                        <BellRing size={22} className="text-violet-300" />
                        <div>
                            <h3 className="font-semibold">Send email alert</h3>
                            <p className="text-xs text-slate-400">
                                Notify the group leader about the deadline.
                            </p>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="mb-4 rounded-lg bg-[#171e2b] p-3 text-sm">
                            <p className="text-slate-400">Recipient</p>
                            <p className="mt-1 font-medium">
                                {findLeader(selectedGroup)?.email || "No leader email"}
                            </p>
                        </div>

                        <label htmlFor="alertMessage" className="mb-2 block text-sm font-medium">
                            Message
                        </label>

                        <textarea
                            id="alertMessage"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            maxLength={2000}
                            placeholder="Write your reminder message..."
                            className="w-full resize-y rounded-lg border border-slate-700 bg-[#0b0d12] p-3 text-sm outline-none focus:border-violet-400"
                        />

                        <p className="mt-2 text-right text-xs text-slate-500">
                            {message.length}/2000
                        </p>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={sendingAlert}
                                onClick={() => document.getElementById("sendAlert")?.close()}
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={!message.trim() || sendingAlert}
                                onClick={sendAlertMail}
                                className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400 disabled:opacity-50"
                            >
                                {sendingAlert ? "Sending..." : "Confirm & Send"}
                            </button>
                        </div>
                    </div>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button>Close</button>
                </form>
            </dialog>
        </main>
    );
};

export default MyGroups;
