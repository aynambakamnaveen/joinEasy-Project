import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppContext } from "../Context/UserContext";
import {
    NotebookText,CalendarDays,Clock3,ClipboardClock,ChevronRight,CheckCircle2,FileText,Users,Search,Plus, X, UserRound,Crown,ClipboardCheck,BellRing,Download} from "lucide-react";
import Card from "../Components/card";
import api from "../api/axios"

const TeacherDashboard = () => {
    const {user, loggedIn, loading, teacherAssignments, teacherGroups,} = useAppContext();
    const [assign, setAssign] = useState<boolean>(true)
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [load, setLoad] = useState<boolean>(false)
    const [title, setTitle] = useState<string>("") 
    const [currentmember, setCurrentmember] = useState<string>("")
    const [members, setMembers] = useState<string[]>([])
    const [leader, setLeader] = useState<string>(members[0] || "")
    const [message, setMessage] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [sendingAlert, setSendingAlert] = useState(false);

    const sendAlertMail = async (
        mail: string,
        teacherName: string,
        dueDate: Date,
        messageText: string
        ) => {
        if (!messageText.trim()) {
            toast.error("Please enter a message");
            return;
        }
        if (!mail || !teacherName || !dueDate || isNaN(dueDate.getTime())) {
            toast.error("Something is missing. Please try again.");
            return;
        }
        try {
            setSendingAlert(true);

            await api.post("/sendAlertMail", {
                email: mail,
                teacherName,
                dueDate: dueDate.toISOString(),
                message,
            });

            toast.success("Alert sent successfully");
            setMessage("");
            document.getElementById("sendAlert")?.close();
            document.getElementById("showData")?.close()
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSendingAlert(false);
        }
    };
    const addMember = () => {
        const member = currentmember.trim();
        if (!member) {
            toast.error("No name included");
            return;

        }
        if (members.includes(member)) {
           toast.error("Member already added");
            return;
        }
        setMembers((prev) => [...prev, member]);
        if (members.length === 0) {
            setLeader(member);
        }
        setCurrentmember("");
    };

    const removeMember = (memberToRemove: string) => {
        if (!members.includes(memberToRemove)) {
            toast.error("Member does not exist");
            return;
        }
        const updatedMembers = members.filter(
            (member) => member !== memberToRemove
        );
        setMembers(updatedMembers);
        if (leader === memberToRemove) {
            setLeader(updatedMembers[0] || "");
        }
    };
    const createGroup = async () => {
            if (!title.trim()) {
                toast.error("Enter a group title");
                return;
            }
            if (members.length === 0) {
                toast.error("Add at least one member");
                return;
            }
            if (!leader || !members.includes(leader)) {
                toast.error("Select a valid group leader");
                return;
            }
            if (!selectedAssignment?._id) {
                toast.error("Select an assignment");
                return;
            }
            setLoad(true);
            try {
                const formData = new FormData();
                formData.append("name", title.trim());
                formData.append("members", JSON.stringify(members));
                formData.append("leader", leader);
                formData.append("assignment", selectedAssignment._id);
                formData.append("AssignTask", String(assign));
                const response = await api.post("/createGroup", formData);
                toast.success("Group created successfully");
                console.log(response.data);
                setTitle("");
                setMembers([]);
                setLeader("");
                setCurrentmember("");
            } catch(error: any){console.error("Failed to create group:",
                error.response?.status,
                error.response?.data
            );
            toast.error(
                error.response?.data?.message || "Failed to create group"
            );
            } finally {
                setLoad(false);
            }
        };
    useEffect(() => {
        if (!loading && !loggedIn) {
        toast.error("Please login to continue");
        navigate("/login");
        }
    }, [loading, loggedIn, navigate]);

    const assignments = useMemo(

        () => teacherAssignments || [],

        [teacherAssignments]

    );

    console.log("teacher assignments", teacherAssignments)

    const assignedGroups = useMemo(

        () =>

        (teacherGroups || []).filter(

            (group) => group.AssignTask !== false

        ),

        [teacherGroups]

    );

    const needsReview = assignedGroups.filter(

        (group) => (group.accepted !== true && group.isSubmitted === true )

    );

    const reviewedGroups = assignedGroups.filter(

        (group) => group.accepted === true

    );

    const awaitingSubmission = assignedGroups.filter(

        (group) => group.isSubmitted !== true

    );

    const normalizedSearch = search.trim().toLowerCase();

    const filteredAssignments = useMemo(

        () =>

        assignments.filter((assignment) =>

            (assignment.title || "")

            .toLowerCase()

            .includes(normalizedSearch)

        ),

        [assignments, normalizedSearch]

    );

    const showcaseAssignments = filteredAssignments.slice(0, 4);

    const deadlines = useMemo(

        () =>

        filteredAssignments

            .filter((assignment) => assignment.dueDate)

            .map((assignment) => ({

            ...assignment,

            daysLeft: getRemainingDays(assignment.dueDate),

            }))

            .sort((a, b) => a.daysLeft - b.daysLeft)

            .slice(0, 4),

        [filteredAssignments]

    );

    function getRemainingDays(dueDate: string | Date): number {

        const today = new Date();

        const due = new Date(dueDate);

        today.setHours(0, 0, 0, 0);

        due.setHours(0, 0, 0, 0);

        return Math.round(

        (due.getTime() - today.getTime()) / 86400000

        );

    }

    function formatDate(date: string | Date): string {

        return new Date(date).toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric",

        });

    }

    function getDeadlineText(daysLeft: number): string {

        if (daysLeft < 0) {

        const days = Math.abs(daysLeft);

        return `${days} ${days === 1 ? "day" : "days"} overdue`;

        }

        if (daysLeft === 0) return "Due today";

        if (daysLeft === 1) return "Due tomorrow";

        return `${daysLeft} days left`;

    }

    function getDeadlineStyle(daysLeft: number) {

        if (daysLeft < 0) {

        return {

            text: "text-rose-400",

            bg: "bg-rose-400/10",

            label: "Overdue",

        };

        }

        if (daysLeft <= 2) {

        return {

            text: "text-amber-400",

            bg: "bg-amber-400/10",

            label: "Due soon",

        };

        }

        return {

        text: "text-slate-400",

        bg: "bg-slate-400/10",

        label: "Scheduled",

        };

    }

    const Assign = async (groupId: string) => {

        try {

            // Corrected template literal and removed invalid object syntax

            const response = await api.patch(`/assign/${groupId}`, {

            assignTask: true 

            });

            toast.success("Task assigned successfully")

        } catch (error) {

            toast.error("something went wrong, try again")

            console.error("Failed to assign group:", error);

        }

    }

    if (loading) {

        return (

        <div className="flex min-h-screen items-center justify-center bg-[#10141b]">

            <span className="loading loading-spinner loading-lg text-slate-400" />

        </div>

        );

    }

    return (

        <main className="min-h-screen bg-[#10141b] text-slate-200">

        {/* Header */}

        <header className="border-b border-white/[0.07] bg-[#10141b]">

            <div className="mx-auto flex min-h-17 max-w-[1600px] flex-col justify-center gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">

            <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-500/15 bg-[#1b222d] text-slate-300">

                <NotebookText size={19} strokeWidth={1.8} />

                </div>

                <div>

                <h2 className="text-sm font-semibold text-slate-100">

                    Teacher Portal

                </h2>

                <p className="mt-0.5 text-xs text-slate-500">

                    Assignment management

                </p>

                </div>

            </div>
            <div className="flex items-center justify-between gap-4 sm:justify-end">

                <label className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-white/8 bg-[#151a23] px-3 transition-colors focus-within:border-slate-500/50 sm:w-72 sm:flex-none">
                <Search

                    size={16}

                    className="shrink-0 text-slate-500"

                />

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

                    <img

                    src={user.profileImage}

                    alt="Teacher profile"

                    className="h-9 w-9 rounded-full border border-white/10 object-cover"

                    />

                ) : (

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#283443] text-sm font-medium text-slate-200">

                        {user?.username?.charAt(0)?.toUpperCase() || "T"}

                    </div>

                )}

                <div className="hidden min-w-0 sm:block">

                    <p className="max-w-32 truncate text-sm font-medium text-slate-200">

                    {user?.username || "Teacher"}

                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">

                    Teacher

                    </p>

                </div>

                </div>

            </div>

            </div>

        </header>

        <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-7 sm:px-6 lg:px-8">

            {/* Page heading */}

            <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

                <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">

                Dashboard

                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">

                Welcome back, {user?.username || "Teacher"}

                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-400">

                Keep track of assignments and student submissions.

                </p>

            </div>

            <div className="flex w-fit items-center gap-2 rounded-lg border border-white/[0.07] bg-[#151a23] px-3 py-2 text-xs text-slate-400">

                <CalendarDays size={15} className="text-slate-400" />

                    {new Date().toLocaleDateString("en-IN", {

                    day: "2-digit",

                    month: "short",

                    year: "numeric",

                    })}

            </div>

            </section>

            {/* Summary cards */}

            <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

            <Card

                assignmentCount={assignments.length}

                title="Total Assignments"

                iconBgColor="bg-slate-500/15"

                iconColor="text-slate-300"

                icon={NotebookText}

            />

            <Card

                assignmentCount={needsReview.length}

                title="Needs Review"

                iconBgColor="bg-amber-400/10"

                iconColor="text-amber-400"

                icon={ClipboardClock}

            />

            <Card

                assignmentCount={awaitingSubmission.length}

                title="Pending Submissions"

                iconBgColor="bg-sky-400/10"

                iconColor="text-sky-400"

                icon={Clock3}

            />

            <Card

                assignmentCount={reviewedGroups.length}

                title="Accepted Submissions"

                iconBgColor="bg-emerald-400/10"

                iconColor="text-emerald-400"

                icon={CheckCircle2}

            />

            </section>

            {/* Main content */}

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">

            {/* Assignments */}

            <div className="min-w-0 rounded-xl border border-white/[0.07] bg-[#151a23] p-4 sm:p-5 xl:col-span-7">

                <div className="mb-5 flex items-center justify-between gap-3">

                <div>

                    <h2 className="text-base font-semibold text-slate-100">

                    Assignments

                    </h2>

                    <p className="mt-1 text-xs text-slate-500">

                    Your latest assignment records

                    </p>

                </div>

                <span className="rounded-md border border-white/[0.07] bg-[#1b222d] px-2.5 py-1.5 text-xs text-slate-400">

                    {filteredAssignments.length} total

                </span>

                </div>

                <div className="space-y-2">

                {showcaseAssignments.length > 0 ? (

                    showcaseAssignments.map((assignment, idx) => (

                    <div

                        key={assignment._id || assignment.id || idx}

                        onClick={() => {

                            document.getElementById('showData').showModal();

                            setSelectedAssignment(assignment);

                        }}

                        className="flex min-w-0 items-center gap-3 rounded-lg border border-white/5.5 bg-[#191f29] p-3.5 transition-all hover:border-white/12 hover:bg-[#1c232e] sm:p-4 cursor-pointer relative group hover:scale-105"

                    >

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#252d39] text-slate-300">

                            <FileText size={19} strokeWidth={1.8} />

                        </div>

                        <div className="min-w-0 flex-1">

                            <h3 className="truncate text-sm font-medium text-slate-200">

                                {assignment.title}

                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">

                                <span className={`inline-flex items-center gap-1.5 ${assignment.groups?.length === 0 ? 'text-red-500' : ''}`}>

                                <Users size={13} />

                                {assignment.groups?.length || 0} groups

                                </span>

                                {assignment.dueDate && (

                                <span className="inline-flex items-center gap-1.5">

                                    <CalendarDays size={13} />

                                    {formatDate(assignment.dueDate)}

                                </span>

                                )}

                            </div>

                        </div>

                        <div className="relative right-0 group-hover:text-blue-600 ">

                            <ChevronRight />

                        </div>

                    </div>

                    ))

                ) : (

                    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-white/9 px-4 text-center">

                    <NotebookText

                        size={25}

                        strokeWidth={1.5}

                        className="mb-3 text-slate-500"

                    />

                    <p className="text-sm font-medium text-slate-300">

                        {normalizedSearch

                        ? "No matching assignments"

                        : "No assignments yet"}

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                        {normalizedSearch

                        ? "Try a different assignment title."

                        : "Your assignments will appear here."}

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

            {/* Deadlines */}

            <div className="min-w-0 rounded-xl border border-white/[0.07] bg-[#151a23] p-4 sm:p-5 xl:col-span-5">

                <div className="mb-5 flex items-center justify-between gap-3">

                <div>

                    <h2 className="text-base font-semibold text-slate-100">

                    Deadlines

                    </h2>

                    <p className="mt-1 text-xs text-slate-500">

                    Closest due dates first

                    </p>

                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#202733] text-slate-300">

                    <CalendarDays size={17} strokeWidth={1.8} />

                </div>

                </div>

                <div className="space-y-2">

                {deadlines.length > 0 ? (

                    deadlines.map((assignment, idx) => {

                    const style = getDeadlineStyle(assignment.daysLeft);

                    return (

                        <div

                        key={assignment._id || assignment.id || idx}

                        className="flex min-w-0 items-center gap-3 rounded-lg border border-white/5.5 bg-[#191f29] p-3.5 transition-colors hover:border-white/12"

                        >

                        <div

                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text}`}

                        >

                            <Clock3 size={17} strokeWidth={1.8} />

                        </div>

                        <div className="min-w-0 flex-1">

                            <h3 className="truncate text-sm font-medium text-slate-200">

                            {assignment.title}

                            </h3>

                            <p className="mt-1 text-xs text-slate-500">

                            {formatDate(assignment.dueDate)}

                            </p>

                        </div>

                        <div className="shrink-0 text-right">

                            <p className={`text-xs font-medium ${style.text}`}>

                            {getDeadlineText(assignment.daysLeft)}

                            </p>

                            <p className="mt-1 text-[10px] text-slate-500">

                            {style.label}

                            </p>

                        </div>

                        </div>

                    );

                    })

                ) : (

                    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-white/9 px-4 text-center">

                    <CalendarDays

                        size={25}

                        strokeWidth={1.5}

                        className="mb-3 text-slate-500"

                    />

                    <p className="text-sm font-medium text-slate-300">

                        No deadlines found

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                        Assignments with due dates appear here.

                    </p>

                    </div>

                )}

                </div>

                {filteredAssignments.filter((a) => a.dueDate).length > 4 && (

                <p className="mt-4 border-t border-white/6 pt-3 text-center text-xs text-slate-500">

                    Showing the 4 closest deadlines

                </p>

                )}

            </div>

            </section>

            <footer className="mt-8 flex flex-col gap-2 border-t border-white/6 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

            <p>Teacher Dashboard</p>

            <p>Assignment and submission overview</p>

            </footer>

        </div>

        {/** Showing data using modal(popup) */}

        <dialog id="showData" className="modal">
        <div className="modal-box flex max-h-[85vh] w-11/12 max-w-2xl flex-col overflow-hidden border border-white/10 bg-[#11141c] p-0 text-slate-100">

            {/* Header */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.08] p-6 sm:p-7">
            <div className="min-w-0">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-300">
                Assignment details
                </p>

                <h3 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">
                {selectedAssignment?.title}
                </h3>
                <p className="text-sm text-slate-400">
                {selectedAssignment?.description}
                </p>
                <a
                    href={selectedAssignment?.fileUrl}
                    download={`${selectedAssignment?.title || "Assignment"} details.pdf`}
                    className="text-sm font-light underline underline-offset-4 hover:text-violet-400"
                    >
                    Download details of assignment
                </a>
                <p className="mt-4 text-xs text-gray-400">
                Groups assigned to this assignment
                </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10 text-violet-300">
                <Users size={20} />
            </div>
            </div>

            {/* Groups section header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-6 py-5 sm:px-7">
            <h4 className="text-sm font-semibold text-slate-200">
                Assigned groups
            </h4>

            <div className="flex shrink-0 items-center gap-3">
                <button className="whitespace-nowrap rounded-md border border-green-400/20 bg-violet-400/10 px-2.5 py-1 text-xs cursor-pointer font-medium text-green-300 flex gap-1 items-center" onClick={()=>document.getElementById('createGroup').showModal()}>
                    <Plus size={18} strokeWidth={1} />{selectedAssignment?.groups?.length > 1 ? "Add group": "create group"}
                </button>
                <span className="whitespace-nowrap rounded-md border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-xs font-medium text-violet-300">
                {selectedAssignment?.groups?.length ?? 0} groups
                </span>
            </div>
            </div>

            {/* Scrollable group list */}
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-4 sm:p-5">
            {selectedAssignment?.groups?.length > 0 ? (
                selectedAssignment.groups.map((group: any) => (
                <div
                    key={group._id}
                    className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0c0f16] p-3.5 transition-colors hover:border-violet-400/25 sm:flex-row sm:items-center"
                >
                    {/* Group icon and details */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300">
                        <Users size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-medium text-slate-100">
                        {group.name}
                        </p>

                        <p
                        className={`mt-1 text-xs ${
                            group.AssignTask
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                        >
                        {group.AssignTask
                            ? "Assigned Tasks"
                            : "Unassigned Tasks"}
                        </p>
                    </div>
                    </div>

                    {/* Group actions */}
                    <div className="flex shrink-0 items-center justify-end gap-3 sm:gap-4">
                    {group.AssignTask && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedGroup(group);
                                setMessage("");
                                document.getElementById("sendAlert")?.showModal();
                            }}
                            className="tooltip cursor-pointer text-slate-200 hover:text-violet-300"
                            data-tip="Send alert"
                            aria-label="Send alert"
                            >
                            <BellRing size={20} strokeWidth={2} />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => Assign(group._id)}
                        disabled={group.AssignTask}
                        className={`btn btn-sm min-w-32 whitespace-nowrap transition-all duration-100 active:scale-95 ${
                        group.AssignTask
                            ? "cursor-not-allowed border border-white/5 bg-[#202530] text-slate-400 opacity-70"
                            : "border-0 bg-green-500 text-white hover:bg-green-400"
                        }`}
                    >
                        {group.AssignTask ? "Task Assigned" : "Assign Task"}
                    </button>
                    </div>
                </div>
                ))
            ) : (
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
                <Users
                    size={24}
                    className="mx-auto mb-3 text-slate-500"
                />

                <p className="text-sm font-medium text-slate-300">
                    No groups assigned
                </p>

                <p className="mt-1 text-xs text-slate-500">
                    Groups will appear here when available.
                </p>
                </div>
            )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end border-t border-white/[0.08] bg-[#11141c] p-4 sm:px-7">
            <form method="dialog">
                <button
                type="submit"
                className="btn btn-sm border border-white/10 bg-[#202530] px-5 text-slate-200 hover:border-white/20 hover:bg-[#292f3c]"
                >
                Close
                </button>
            </form>
            </div>
        </div>

        {/* Modal backdrop */}
        <form method="dialog" className="modal-backdrop bg-black/70">
            <button type="submit" aria-label="Close modal">
            close
            </button>
        </form>
        </dialog>


        {/**Component for creatig group */}

        <dialog id="createGroup" className="modal">

            <div className="modal-box max-w-4xl w-[95vw] p-0 rounded-2xl overflow-hidden bg-base-100 border border-base-300 max-h-[92vh]">

                <form

                    onSubmit={(e) => {

                        e.preventDefault();

                        void createGroup();

                    }}

                    className="flex flex-col max-h-[92vh]"

                >

                    {/* Colorful header */}

                    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 sm:px-8 py-6 text-white shrink-0">

                        <div className="absolute -right-8 -top-16 w-48 h-48 rounded-full bg-white/10" />

                        <div className="absolute right-28 -bottom-16 w-32 h-32 rounded-full bg-white/10" />

                        <div className="relative flex justify-between items-start gap-4">

                            <div>

                                <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-[0.18em] mb-2">

                                    <span className="w-2 h-2 rounded-full bg-emerald-300" />

                                    Assignment management

                                </div>

                                <h2 className="text-2xl sm:text-3xl font-bold">

                                    Create a group

                                </h2>

                                <p className="text-white/80 text-sm mt-2 max-w-md">

                                    Bring your team together and organize assignment responsibilities.

                                </p>

                            </div>

                            <button

                                type="button"

                                onClick={() =>

                                    document.getElementById("createGroup")?.close()

                                }

                                className="btn btn-sm btn-circle bg-white/15 border-white/20 text-white hover:bg-white/25"

                                aria-label="Close modal"

                            >

                                <X size={18} />

                            </button>

                        </div>

                        {/* Assignment banner */}

                        <div className="relative mt-5 flex items-center gap-3 rounded-xl bg-black/15 border border-white/15 p-3">

                            <div className="w-11 h-11 rounded-xl bg-amber-300 text-amber-950 flex items-center justify-center shrink-0">

                                <NotebookText size={22} />

                            </div>

                            <div className="min-w-0 flex-1">

                                <p className="text-xs text-white/70">

                                    Creating a group for

                                </p>

                                <p className="font-semibold truncate">

                                    {selectedAssignment?.title || "No assignment selected"}

                                </p>

                            </div>

                            <span className="hidden sm:inline-flex badge border-white/25 text-white bg-white/10">

                                Assignment

                            </span>

                        </div>

                    </div>

                    {/* Horizontal two-column layout */}

                    <div className="overflow-y-auto p-5 sm:p-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

                            {/* LEFT: Group details */}

                            <div className="space-y-6">

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">

                                        <Users size={21} />

                                    </div>

                                    <div>

                                        <h3 className="font-bold text-base">

                                            Group details

                                        </h3>

                                        <p className="text-xs text-base-content/60">

                                            Name your team and add members

                                        </p>

                                    </div>

                                </div>

                                {/* Group name */}

                                <div>

                                    <label

                                        htmlFor="Title"

                                        className="block text-sm font-semibold mb-2"

                                    >

                                        Group name <span className="text-error">*</span>

                                    </label>

                                    <input

                                        value={title}

                                        onChange={(e) => setTitle(e.target.value)}

                                        type="text"

                                        id="Title"

                                        className="input input-bordered w-full rounded-xl focus:border-indigo-500"

                                        placeholder="e.g. Project Alpha"

                                        maxLength={100}

                                        required

                                    />

                                </div>

                                {/* Add members */}

                                <div>

                                    <div className="flex items-center justify-between mb-2">

                                        <label

                                            htmlFor="Members"

                                            className="text-sm font-semibold"

                                        >

                                            Team members

                                        </label>

                                        <span className="text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full">

                                            {members.length} added

                                        </span>

                                    </div>

                                    <div className="flex gap-2">

                                        <input

                                            value={currentmember}

                                            onChange={(e) =>

                                                setCurrentmember(e.target.value)

                                            }

                                            type="text"

                                            id="Members"

                                            className="input input-bordered flex-1 min-w-0 rounded-xl"

                                            placeholder="Enter member name"

                                            maxLength={100}

                                            onKeyDown={(e) => {

                                                if (e.key === "Enter") {

                                                    e.preventDefault();

                                                    addMember();

                                                }

                                            }}

                                        />

                                        <button

                                            type="button"

                                            onClick={addMember}

                                            className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl px-4"

                                        >

                                            Add

                                        </button>

                                    </div>

                                    {/* Member list */}

                                    <div className="mt-3 min-h-28 max-h-48 overflow-y-auto rounded-xl border border-dashed border-base-300 bg-base-200/40 p-3">

                                        {members.length > 0 ? (

                                            <div className="flex flex-wrap content-start gap-2">

                                                {members.map((member, index) => (

                                                    <div

                                                        key={`${member}-${index}`}

                                                        className="inline-flex items-center gap-2 max-w-full rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-3 py-2"

                                                    >

                                                        <span className="text-sm font-medium break-all">

                                                            {member}

                                                        </span>

                                                        <button

                                                            type="button"

                                                            onClick={() =>

                                                                removeMember(member)

                                                            }

                                                            className="shrink-0 rounded-md p-0.5 hover:bg-error/15 hover:text-error"

                                                            aria-label={`Remove ${member}`}

                                                        >

                                                            <X size={15} />

                                                        </button>

                                                    </div>

                                                ))}

                                            </div>

                                        ) : (

                                            <div className="min-h-24 flex flex-col items-center justify-center text-center">

                                                <Users

                                                    size={25}

                                                    className="text-base-content/30 mb-2"

                                                />

                                                <p className="text-sm font-medium text-base-content/60">

                                                    Your team starts here

                                                </p>

                                                <p className="text-xs text-base-content/40 mt-1">

                                                    Add at least one member

                                                </p>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>

                            {/* RIGHT: Leadership and settings */}

                            <div className="space-y-6">

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">

                                        <UserRound size={21} />

                                    </div>

                                    <div>

                                        <h3 className="font-bold text-base">

                                            Leadership & settings

                                        </h3>

                                        <p className="text-xs text-base-content/60">

                                            Configure your team's responsibilities

                                        </p>

                                    </div>

                                </div>

                                {/* Leader selection */}

                                <div className="rounded-xl border border-base-300 p-4">

                                    <div className="flex items-center gap-3 mb-4">

                                        <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">

                                            <Crown size={19} />

                                        </div>

                                        <div>

                                            <p className="font-semibold text-sm">

                                                Group leader

                                            </p>

                                            <p className="text-xs text-base-content/60">

                                                Select a member to lead the group

                                            </p>

                                        </div>

                                    </div>

                                    <select

                                        id="groupLeader"

                                        value={leader}

                                        onChange={(e) => setLeader(e.target.value)}

                                        className="select select-bordered w-full rounded-xl"

                                        disabled={members.length === 0}

                                        required

                                    >

                                        <option value="" disabled>

                                            Select group leader

                                        </option>

                                        {members.map((member) => (

                                            <option key={member} value={member}>

                                                {member}

                                            </option>

                                        ))}

                                    </select>

                                    {leader && (

                                        <div className="flex items-center gap-2 mt-3 text-sm text-emerald-600 dark:text-emerald-400">

                                            <CheckCircle2 size={16} />

                                            <span>

                                                {leader} will lead this group

                                            </span>

                                        </div>

                                    )}

                                </div>

                                {/* Assignment settings */}

                                <div className="rounded-xl border border-base-300 overflow-hidden">

                                    <div className="p-4 flex items-start gap-3">

                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-500/15 text-violet-500 flex items-center justify-center">

                                            <ClipboardCheck size={20} />

                                        </div>

                                        <div className="flex-1 min-w-0">

                                            <p className="font-semibold text-sm">

                                                Assignment access

                                            </p>

                                            <p className="text-xs text-base-content/60 mt-1 leading-relaxed">

                                                Choose whether this group should receive the selected assignment.

                                            </p>

                                        </div>

                                    </div>

                                    <div className={`mx-4 mb-4 rounded-xl p-4 flex items-center justify-between gap-3 ${

                                        assign

                                            ? "bg-emerald-500/10 border border-emerald-500/20"

                                            : "bg-base-200 border border-base-300"

                                    }`}>

                                        <div>

                                            <p className={`text-sm font-semibold ${

                                                assign

                                                    ? "text-emerald-600 dark:text-emerald-400"

                                                    : "text-base-content"

                                            }`}>

                                                {assign ? "Assignment enabled" : "Assignment disabled"}

                                            </p>

                                            <p className="text-xs text-base-content/60 mt-1">

                                                {assign

                                                    ? "The group will receive this task."

                                                    : "Create the group without assigning this task."}

                                            </p>

                                        </div>

                                        <input

                                            type="checkbox"

                                            checked={assign}

                                            onChange={(e) =>

                                                setAssign(e.target.checked)

                                            }

                                            className="toggle toggle-success shrink-0"

                                            aria-label="Assign selected task"

                                        />

                                    </div>

                                </div>

                                {/* Summary */}

                                <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-4">

                                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-3">

                                        Group summary

                                    </p>

                                    <div className="flex items-center justify-between gap-3 text-sm mb-2">

                                        <span className="text-base-content/60">

                                            Group members

                                        </span>

                                        <span className="font-semibold">

                                            {members.length}

                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between gap-3 text-sm mb-2">

                                        <span className="text-base-content/60">

                                            Group leader

                                        </span>

                                        <span className="font-semibold truncate max-w-[55%]">

                                            {leader || "Not selected"}

                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between gap-3 text-sm">

                                        <span className="text-base-content/60">

                                            Task assignment

                                        </span>

                                        <span className={`font-semibold ${

                                            assign ? "text-emerald-500" : "text-base-content/50"

                                        }`}>

                                            {assign ? "Enabled" : "Disabled"}

                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Footer */}

                    <div className="shrink-0 border-t border-base-300 bg-base-200/60 px-5 sm:px-8 py-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">

                        <p className="text-xs text-base-content/50 hidden sm:block">

                            <span className="text-error">*</span> Required field

                        </p>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:ml-auto">

                            <button

                                type="button"

                                className="btn btn-ghost rounded-xl"

                                disabled={load}

                                onClick={() =>

                                    document.getElementById("createGroup")?.close()

                                }

                            >

                                Cancel

                            </button>

                            <button

                                type="submit"

                                className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl min-w-40"

                                disabled={

                                    load ||

                                    !title.trim() ||

                                    members.length === 0 ||

                                    !leader ||

                                    !members.includes(leader) ||

                                    !selectedAssignment?._id

                                }

                            >

                                {load ? (

                                    <>
                                        <span className="loading loading-spinner loading-sm" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />

                                        Create group

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </form>

            </div>

        </dialog>

        {/**send alert */}

        <dialog id="sendAlert" className="modal">
            <div className="modal-box w-11/12 max-w-lg border border-white/10 bg-[#11141c] p-0 text-slate-100">
                {/* Header */}
                <div className="flex items-start gap-4 border-b border-white/10 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                    <BellRing size={21} />
                </div>

                <div>
                    <h3 className="text-xl font-semibold">
                    Send email alert
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                    Notify the assigned group about the upcoming deadline.
                    </p>
                </div>
                </div>

                {/* Message */}
                <div className="p-6">
                <label
                    htmlFor="alertMessage"
                    className="mb-2 block text-sm font-medium text-slate-200"
                >
                    Message
                </label>

                <textarea
                    id="alertMessage"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your alert message..."
                    rows={5}
                    maxLength={2000}
                    className="w-full resize-y rounded-xl border border-white/10 bg-[#0c0f16] p-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400/50"
                />

                <p className="mt-2 text-right text-xs text-slate-500">
                    {message.length}/2000
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <form method="dialog">
                    <button
                        type="submit"
                        disabled={sendingAlert}
                        className="btn btn-sm border border-white/10 bg-[#202530] text-slate-200 hover:bg-[#292f3c]"
                    >
                        Cancel
                    </button>
                    </form>

                    <button
                    type="button"
                    disabled={!message.trim() || sendingAlert}
                    onClick={() => {
                        if (!selectedGroup) return;

                        const leader = selectedGroup.members.find(
                            (member: any) =>
                            String(member._id) === String(selectedGroup.leader)
                        );

                        if (!leader?.email) {
                            toast.error("Group leader email not found");
                            return;
                        }

                        const teacherName = user?.username;

                        if (!teacherName) {
                            toast.error("Teacher username not found");
                            return;
                        }

                        sendAlertMail(
                            leader.email,
                            teacherName,
                            new Date(selectedAssignment.dueDate),
                            message
                        );
                        }}
                    className="btn btn-sm border-0 bg-green-500 text-white hover:bg-green-400 disabled:opacity-50"
                    >
                    {sendingAlert ? "Sending..." : "Confirm & Send"}
                    </button>
                </div>
                </div>
            </div>

            {/* Backdrop */}
            <form method="dialog" className="modal-backdrop bg-black/70">
                <button type="submit" aria-label="Close modal">
                Close
                </button>
            </form>
        </dialog>

        </main>

    );

};

export default TeacherDashboard;