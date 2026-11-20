import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppContext } from "../Context/UserContext";
import {
    NotebookText,CalendarDays,Clock3,ChevronRight,CheckCircle2,FileText,Search,Users,X,Download
} from "lucide-react";
import Card from "../Components/card";

const getRemainingDays = (dueDate: string | Date): number => {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);
    return Math.round((due.getTime() - today.getTime()) / 86400000);
};

const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString("en-IN",{
        day:"2-digit",
        month:"short",
        year:"numeric"
    });
};

const getDeadlineText = (daysLeft: number): string => {
    if (daysLeft < 0) {
        const days = Math.abs(daysLeft);
        return `${days} ${days === 1 ? "day" : "days"} overdue`;
    }
    if (daysLeft === 0) return "Due today";
    if (daysLeft === 1) return "Due tomorrow";
    return `${daysLeft} days left`;
};

const getDeadlineStyle = (daysLeft: number) => {
    if (daysLeft < 0) {
        return {text:"text-rose-400",bg:"bg-rose-400/10",label:"Overdue"};
    }
    if (daysLeft <= 2) {
        return {text:"text-amber-400",bg:"bg-amber-400/10",label:"Due soon"};
    }
    return {text:"text-slate-400",bg:"bg-slate-400/10",label:"Scheduled"};
};

const StudentDashboard = () => {
    const {user,loggedIn,loading,studentGroups,assignments} = useAppContext();
    const navigate = useNavigate();
    const [search,setSearch] = useState("");
    const [selectedAssignment,setSelectedAssignment] = useState<any>(null);

    const assignmentList = assignments || [];
    const groupList = studentGroups || [];

    useEffect(() => {
        if (!loading && !loggedIn) {
            toast.error("Please login to continue");
            navigate("/login");
        }
    },[loading,loggedIn,navigate]);

    const assignedGroups = useMemo(
        () => groupList.filter((group:any) => group.AssignTask === true),
        [groupList]
    );

    const awaitingSubmission = useMemo(
        () => assignedGroups.filter((group:any) => group.isSubmitted !== true),
        [assignedGroups]
    );

    const acceptedGroups = useMemo(
        () => assignedGroups.filter((group:any) => group.isSubmitted === true && group.accepted === true),
        [assignedGroups]
    );

    console.log("Accepted Groups:", acceptedGroups);

    const normalizedSearch = search.trim().toLowerCase();

    const filteredAssignments = useMemo(
        () => assignmentList.filter((assignment:any) =>
            (assignment.title || "").toLowerCase().includes(normalizedSearch)
        ),
        [assignmentList,normalizedSearch]
    );

    const showcaseAssignments = filteredAssignments.slice(0,4);

    const deadlines = useMemo(
        () => filteredAssignments
            .filter((assignment:any) => assignment.dueDate)
            .map((assignment:any) => ({
                ...assignment,
                daysLeft:getRemainingDays(assignment.dueDate)
            }))
            .sort((a:any,b:any) => a.daysLeft - b.daysLeft)
            .slice(0,4),
        [filteredAssignments]
    );

    const openAssignment = (assignment:any) => {
        setSelectedAssignment(assignment);
        (document.getElementById("showData") as HTMLDialogElement)?.showModal();
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#10141b]">
                <span className="loading loading-spinner loading-lg text-slate-400"/>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#10141b] text-slate-200">
            <header className="border-b border-white/[0.07] bg-[#10141b]">
                <div className="mx-auto flex min-h-17 max-w-[1600px] flex-col justify-center gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-500/15 bg-[#1b222d] text-slate-300">
                            <NotebookText size={19} strokeWidth={1.8}/>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-100">Student Portal</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Assignment management</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <label className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-white/8 bg-[#151a23] px-3 transition-colors focus-within:border-slate-500/50 sm:w-72 sm:flex-none">
                            <Search size={16} className="shrink-0 text-slate-500"/>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                type="search"
                                placeholder="Search assignments..."
                                aria-label="Search assignments"
                                className="w-full min-w-0 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
                            />
                        </label>
                        <div className="flex shrink-0 items-center gap-2.5 border-l border-white/8 pl-4">
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="Student profile" className="h-9 w-9 rounded-full border border-white/10 object-cover"/>
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#283443] text-sm font-medium text-slate-200">
                                    {user?.username?.charAt(0)?.toUpperCase() || "S"}
                                </div>
                            )}
                            <div className="hidden min-w-0 sm:block">
                                <p className="max-w-32 truncate text-sm font-medium text-slate-200">{user?.username || "Student"}</p>
                                <p className="mt-0.5 text-xs text-slate-500">Student</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-7 sm:px-6 lg:px-8">
                <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Dashboard</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
                            Welcome back, {user?.username || "Student"}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Keep track of your assignments and submission progress.
                        </p>
                    </div>
                    <div className="flex w-fit items-center gap-2 rounded-lg border border-white/[0.07] bg-[#151a23] px-3 py-2 text-xs text-slate-400">
                        <CalendarDays size={15} className="text-slate-400"/>
                        {formatDate(new Date())}
                    </div>
                </section>

                <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <Card
                        assignmentCount={assignmentList.length}
                        title="Total Assignments"
                        iconBgColor="bg-slate-500/15"
                        iconColor="text-slate-300"
                        icon={NotebookText}
                    />
                    <Card
                        assignmentCount={awaitingSubmission.length}
                        title="Pending Submissions"
                        iconBgColor="bg-sky-400/10"
                        iconColor="text-sky-400"
                        icon={Clock3}
                    />
                    <Card
                        assignmentCount={acceptedGroups.length}
                        title="Accepted Submissions"
                        iconBgColor="bg-emerald-400/10"
                        iconColor="text-emerald-400"
                        icon={CheckCircle2}
                    />
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                    <div className="min-w-0 rounded-xl border border-white/[0.07] bg-[#151a23] p-4 sm:p-5 xl:col-span-7">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-slate-100">My Assignments</h2>
                                <p className="mt-1 text-xs text-slate-500">Assignments available to you</p>
                            </div>
                            <span className="rounded-md border border-white/[0.07] bg-[#1b222d] px-2.5 py-1.5 text-xs text-slate-400">
                                {filteredAssignments.length} total
                            </span>
                        </div>
                        <div className="space-y-2">
                            {showcaseAssignments.length > 0 ? (
                                showcaseAssignments.map((assignment:any,idx:number) => (
                                    <div
                                        key={assignment._id || assignment.id || idx}
                                        onClick={() => openAssignment(assignment)}
                                        className="group relative flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-white/5.5 bg-[#191f29] p-3.5 transition-all hover:border-white/12 hover:bg-[#1c232e] sm:p-4"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#252d39] text-slate-300">
                                            <FileText size={19} strokeWidth={1.8}/>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <h3 className="truncate text-sm font-medium text-slate-200">{assignment.title}</h3>
                                                {assignment.isClosed === true && (
                                                    <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">Closed</span>
                                                )}
                                            </div>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                                {assignment.dueDate && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <CalendarDays size={13}/>
                                                        {formatDate(assignment.dueDate)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="shrink-0 text-slate-500 transition-colors group-hover:text-blue-400"/>
                                    </div>
                                ))
                            ) : (
                                <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-white/9 px-4 text-center">
                                    <NotebookText size={25} strokeWidth={1.5} className="mb-3 text-slate-500"/>
                                    <p className="text-sm font-medium text-slate-300">
                                        {normalizedSearch ? "No matching assignments" : "No assignments yet"}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {normalizedSearch ? "Try a different assignment title." : "Your assignments will appear here."}
                                    </p>
                                </div>
                            )}
                        </div>
                        {filteredAssignments.length > 4 && (
                            <p className="mt-4 border-t border-white/6 pt-3 text-center text-xs text-slate-500">
                                Showing 4 of {filteredAssignments.length} assignments
                            </p>
                        )}
                    </div>

                    <div className="min-w-0 rounded-xl border border-white/[0.07] bg-[#151a23] p-4 sm:p-5 xl:col-span-5">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-slate-100">Upcoming Deadlines</h2>
                                <p className="mt-1 text-xs text-slate-500">Closest due dates first</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#202733] text-slate-300">
                                <CalendarDays size={17} strokeWidth={1.8}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {deadlines.length > 0 ? (
                                deadlines.map((assignment:any,idx:number) => {
                                    const style = getDeadlineStyle(assignment.daysLeft);
                                    return (
                                        <div key={assignment._id || assignment.id || idx} className="flex min-w-0 items-center gap-3 rounded-lg border border-white/5.5 bg-[#191f29] p-3.5 transition-colors hover:border-white/12">
                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text}`}>
                                                <Clock3 size={17} strokeWidth={1.8}/>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-sm font-medium text-slate-200">{assignment.title}</h3>
                                                <p className="mt-1 text-xs text-slate-500">{formatDate(assignment.dueDate)}</p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className={`text-xs font-medium ${style.text}`}>{getDeadlineText(assignment.daysLeft)}</p>
                                                <p className="mt-1 text-[10px] text-slate-500">{style.label}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-white/9 px-4 text-center">
                                    <CalendarDays size={25} strokeWidth={1.5} className="mb-3 text-slate-500"/>
                                    <p className="text-sm font-medium text-slate-300">No deadlines found</p>
                                    <p className="mt-1 text-xs text-slate-500">Assignments with due dates appear here.</p>
                                </div>
                            )}
                        </div>
                        {filteredAssignments.filter((a:any) => a.dueDate).length > 4 && (
                            <p className="mt-4 border-t border-white/6 pt-3 text-center text-xs text-slate-500">
                                Showing the 4 closest deadlines
                            </p>
                        )}
                    </div>
                </section>

                <footer className="mt-8 flex flex-col gap-2 border-t border-white/6 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>Student Dashboard</p>
                    <p>Assignment and submission overview</p>
                </footer>
            </div>

            <dialog id="showData" className="modal">
                <div className="modal-box flex max-h-[85vh] w-11/12 max-w-2xl flex-col overflow-hidden border border-white/10 bg-[#11141c] p-0 text-slate-100">
                    <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.08] p-6 sm:p-7">
                        <div className="min-w-0">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-300">Assignment details</p>
                            <h3 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">
                                {selectedAssignment?.title}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                {selectedAssignment?.description || "No description available."}
                            </p>
                        </div>
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10 text-violet-300">
                            <FileText size={20}/>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto p-6">
                        {selectedAssignment?.dueDate && (
                            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#191f29] p-4">
                                <CalendarDays size={19} className="text-violet-300"/>
                                <div>
                                    <p className="text-xs text-slate-500">Submission deadline</p>
                                    <p className="mt-1 text-sm font-medium text-slate-200">{formatDate(selectedAssignment.dueDate)}</p>
                                </div>
                            </div>
                        )}
                        {selectedAssignment?.isClosed === true && (
                            <p className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-400">
                                This assignment is closed.
                            </p>
                        )}
                        {selectedAssignment?.fileUrl && (
                            <a
                                href={selectedAssignment.fileUrl}
                                download={`${selectedAssignment.title || "Assignment"} details`}
                                className="inline-flex items-center gap-2 text-sm text-violet-300 underline underline-offset-4 hover:text-violet-200"
                            >
                                <Download size={16}/>
                                Download assignment details
                            </a>
                        )}
                    </div>
                    <div className="flex shrink-0 justify-end border-t border-white/[0.08] bg-[#11141c] p-4 sm:px-7">
                        <form method="dialog">
                            <button type="submit" className="btn btn-sm border border-white/10 bg-[#202530] px-5 text-slate-200 hover:border-white/20 hover:bg-[#292f3c]">
                                Close
                            </button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop bg-black/70">
                    <button type="submit" aria-label="Close modal">close</button>
                </form>
            </dialog>
        </main>
    );
};

export default StudentDashboard;