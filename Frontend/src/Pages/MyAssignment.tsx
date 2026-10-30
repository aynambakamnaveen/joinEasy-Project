import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
    NotebookText,
    Plus,
    Search,
    CalendarDays,
    Clock3,
    CheckCircle2,
    CircleDashed,
    AlertCircle,
    ClipboardList,
    ArrowUpRight,
    NotepadText, Link2, FileUp, X,
    GraduationCap ,
    UserRound ,
    Crown , ClipboardCheck,MoreVertical, Users, BellRing 
} from "lucide-react";
import { useAppContext } from "../Context/UserContext";
import api from "../api/axios";
type AssignmentFilter =
    | "all"
    | "pending"
    | "graded"
    | "needsReview"
    | "expired";

const filters: {
    label: string;
    value: AssignmentFilter;
}[] = [
    { label: "All assignments", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Graded", value: "graded" },
    { label: "Needs review", value: "needsReview" },
    { label: "Expired", value: "expired" },
];

const MyAssignments = () => {
    const {
        user,
        loggedIn,
        loading,
        teacherAssignments,
        setTeacherAssignments
    } = useAppContext();
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [link, setLink] = useState("")
    const [file, setFile] = useState<File | null>(null);
    const [search, setSearch] = useState("");
    const [selected, setSelected] =
        useState<AssignmentFilter>("all");
    const [load, setLoad] = useState<boolean>(false)
    const [assign, setAssign] = useState<boolean>(true)
    const [currentmember, setCurrentmember] = useState<string>("")
    const [members, setMembers] = useState<string[]>([])
    const [leader, setLeader] = useState<string>(members[0] || "")
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [sendingAlert, setSendingAlert] = useState(false);
    const [message, setMessage] = useState("");
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
    const assignments = useMemo(
        () => teacherAssignments || [],
        [teacherAssignments]
    );
    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
        ) => {
        event.preventDefault();
        setLoad(true);

        const formData = new FormData();

        formData.append("title", title);
        formData.append("description", description);
        formData.append("dueDate", dueDate);
        formData.append("oneDriveLink", link);

        if (file) {
            formData.append("file", file);
        }

        try {
            const response:any = await api.post(
            "/createAssignment",
            formData
            );

            toast.success("New assignment created");

            document.getElementById("createAssignment")?.close();

            setTitle("");
            setDescription("");
            setDueDate("");
            setLink("");
            setFile(null);
            setTeacherAssignments([...teacherAssignments, response.assignment])
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong, please try later");
        } finally {
            setLoad(false);
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
    function findLeader(membersList: any[], leader: string) {
        const leaderF = membersList.find(
            (member) => String(member._id) === String(leader)
        );
        return leaderF?.username
    }
    //console.log(findLeader(assignments[0]?.groups.members, assignments[0]?.groups.leader))
    
    useEffect(() => {
        if (!loading && !loggedIn) {
        toast.error("Please login to continue");
        navigate("/login");
        }
    }, [loading, loggedIn, navigate]);

    function getRemainingDays(
        dueDate: string | Date
    ): number {
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

    function getStatus(assignment: (typeof assignments)[number]) {
        if (assignment.isClosed && assignment.isCompleted) {
        return {
            label: "Graded",
            icon: CheckCircle2,
            style: "bg-emerald-400/10 text-emerald-300",
        };
        }

        if (assignment.isClosed && !assignment.isCompleted) {
        return {
            label: "Expired",
            icon: AlertCircle,
            style: "bg-rose-400/10 text-rose-300",
        };
        }

        if (!assignment.isClosed && assignment.isCompleted) {
        return {
            label: "Needs review",
            icon: Clock3,
            style: "bg-amber-400/10 text-amber-300",
        };
        }

        return {
        label: "Pending",
        icon: CircleDashed,
        style: "bg-blue-400/10 text-blue-300",
        };
    }

    const normalizedSearch = search.trim().toLowerCase();

    const filteredAssignments = useMemo(() => {
        return assignments.filter((assignment) => {
        const matchesSearch = (
            assignment.title || ""
        )
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
            selected === "all" ||
            (selected === "expired" &&
            assignment.isClosed &&
            !assignment.isCompleted) ||
            (selected === "pending" &&
            !assignment.isClosed &&
            !assignment.isCompleted) ||
            (selected === "graded" &&
            assignment.isClosed &&
            assignment.isCompleted) ||
            (selected === "needsReview" &&
            !assignment.isClosed &&
            assignment.isCompleted);

        return matchesSearch && matchesStatus;
        });
    }, [assignments, normalizedSearch, selected]);

    const counts = useMemo(() => {
        return {
        all: assignments.length,
        pending: assignments.filter(
            (a) => !a.isClosed && !a.isCompleted
        ).length,
        graded: assignments.filter(
            (a) => a.isClosed && a.isCompleted
        ).length,
        needsReview: assignments.filter(
            (a) => !a.isClosed && a.isCompleted
        ).length,
        expired: assignments.filter(
            (a) => a.isClosed && !a.isCompleted
        ).length,
        };
    }, [assignments]);
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
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                <NotebookText size={20} />
                </div>

                <div className="min-w-0">
                <h2 className="text-sm font-semibold">
                    Teacher Portal
                </h2>
                <p className="text-xs text-slate-500">
                    Assignment management
                </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {user?.profileImage ? (
                <img
                    src={user.profileImage}
                    alt="Teacher profile"
                    className="h-9 w-9 rounded-full object-cover"
                />
                ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#242332] text-sm font-semibold text-violet-200">
                    {user?.username?.charAt(0)?.toUpperCase() || "T"}
                </div>
                )}

                <div className="hidden sm:block">
                <p className="max-w-36 truncate text-sm font-medium">
                    {user?.username || "Teacher"}
                </p>
                <p className="text-xs text-slate-500">
                    Teacher account
                </p>
                </div>
            </div>
            </div>
        </header>

        <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
            {/* Page heading */}
            <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                Workspace
                </p>

                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                My Assignments
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Create, organize, and track assignment progress
                across your classes.
                </p>
            </div>

            {user?.role === "teacher" && (
                <button
                    type="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-400 active:bg-violet-600"
                    onClick={() => {
                        const dialog = document.getElementById(
                        "createAssignment"
                        ) as HTMLDialogElement | null;

                        dialog?.showModal();
                    }}
                    >
                    <Plus size={18} />
                    Create assignment
                </button>
            )}
            </section>

            {/* Summary */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {filters.map((filter) => {
                const active = selected === filter.value;
                const count = counts[filter.value];

                return (
                <button
                    key={filter.value}
                    type="button"
                    onClick={() => setSelected(filter.value)}
                    aria-pressed={active}
                    className={`min-w-0 rounded-xl border p-4 text-left transition-colors ${
                    active
                        ? "border-violet-400/40 bg-violet-400/9"
                        : "border-white/[0.07] bg-[#11141c] hover:border-white/[0.14] hover:bg-[#151923]"
                    }`}
                >
                    <div className="flex items-center justify-between gap-2">
                    <span
                        className={`text-xs font-medium sm:text-sm ${
                        active
                            ? "text-violet-200"
                            : "text-slate-400"
                        }`}
                    >
                        {filter.label}
                    </span>

                    {active && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300" />
                    )}
                    </div>

                    <p
                    className={`mt-3 text-2xl font-semibold tabular-nums ${
                        active ? "text-violet-100" : "text-slate-100"
                    }`}
                    >
                    {count}
                    </p>
                </button>
                );
            })}
            </section>

            {/* Assignment list */}
            <section className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#11141c]">
            <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                <h2 className="font-semibold">
                    {filters.find((f) => f.value === selected)?.label}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                    {filteredAssignments.length}{" "}
                    {filteredAssignments.length === 1
                    ? "assignment"
                    : "assignments"}{" "}
                    found
                </p>
                </div>

                <label className="flex h-10 w-full items-center gap-2.5 rounded-lg border border-white/[0.09] bg-[#0b0d12] px-3 transition-colors focus-within:border-violet-400/50 sm:max-w-xs">
                <Search size={16} className="shrink-0 text-slate-500" />

                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search assignments..."
                    aria-label="Search assignments"
                    className="w-full min-w-0 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
                />
                </label>
            </div>
            {filteredAssignments.length > 0 ? (
                <div className="divide-y divide-white/6">
                {filteredAssignments.map((assignment) => {
                    const status = getStatus(assignment);
                    const StatusIcon = status.icon;

                    const daysLeft = assignment.dueDate
                    ? getRemainingDays(assignment.dueDate)
                    : null;

                    return (
                    <article
                        key={assignment._id}
                        className="group flex flex-col gap-4 px-4 py-5 transition-colors hover:bg-white/2 sm:px-5 md:flex-row md:items-center md:justify-between"
                    >
                        <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/4 text-slate-400">
                            <ClipboardList size={19} />
                        </div>

                        <div className="min-w-0">
                            <h3 className="break-words font-medium text-slate-100">
                            {assignment.title || "Untitled assignment"}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                            {assignment.dueDate && (
                                <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={14} />
                                {formatDate(assignment.dueDate)}
                                </span>
                            )}

                            {daysLeft !== null && (
                                <span
                                className={
                                    daysLeft < 0
                                    ? "text-rose-300"
                                    : daysLeft <= 2
                                    ? "text-amber-300"
                                    : "text-slate-500"
                                }
                                >
                                {daysLeft < 0
                                    ? `${Math.abs(daysLeft)} ${
                                        Math.abs(daysLeft) === 1
                                        ? "day"
                                        : "days"
                                    } overdue`
                                    : daysLeft === 0
                                    ? "Due today"
                                    : daysLeft === 1
                                    ? "Due tomorrow"
                                    : `${daysLeft} days left`}
                                </span>
                            )}
                            </div>
                        </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pl-13 md:justify-end md:pl-0">
                            {assignment.isClosed && <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium bg-yellow-400/10 text-yellow-300`}
                            >
                                closed
                            </span> }
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                    setSelectedAssignment(assignment);
                                    document
                                    .getElementById("my_modal_2")
                                    ?.showModal();
                                }}
                                >
                                {`View groups (${assignment?.groups?.length ?? 0})`}
                            </button>
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium ${status.style}`}
                            >
                                <StatusIcon size={13} />
                                {status.label}
                            </span>

                            <button
                                type="button"
                                aria-label={`Open ${assignment.title || "assignment"}`}
                                onClick={() => {
                                // Add your assignment details navigation here.
                                }}
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/6 hover:text-slate-200"
                            >
                                <ArrowUpRight size={17} />
                            </button>
                        </div>
                    </article>
                    );
                })}
                </div>
            ) : (
                <div className="flex flex-col items-center px-5 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-slate-500">
                    {search ? <Search size={22} /> : <ClipboardList size={22} />}
                </div>

                <h3 className="font-medium text-slate-200">
                    {search
                    ? "No matching assignments"
                    : "Nothing here yet"}
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    {search
                    ? "Try another search term or select a different filter."
                    : "There are no assignments in this category yet."}
                </p>

                {(search || selected !== "all") && (
                    <button
                    type="button"
                    onClick={() => {
                        setSearch("");
                        setSelected("all");
                    }}
                    className="mt-4 rounded-lg px-3 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-400/10"
                    >
                    Clear filters
                    </button>
                )}
                </div>
            )}
            </section>
        </div>
    
        {/**Create assignment modal */}
        <dialog id="createAssignment" className="modal">
        <div className="modal-box w-11/12 max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-[#0e1118] p-0 text-slate-100">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 bg-[#141925] px-5 py-5 sm:px-7">
            <div>
                <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                    <NotebookText size={19} />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-300">
                    Teacher workspace
                </span>
                </div>

                <h3 className="text-xl font-bold sm:text-2xl">
                Create assignment
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">
                Add instructions, set a deadline, and share resources with students.
                </p>
            </div>

            <button
                type="button"
                aria-label="Close dialog"
                onClick={() =>
                document.getElementById("createAssignment")?.close()
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
                <X size={18} />
            </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
            <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-6 sm:px-7">

                {/* Title */}
                <div>
                <label
                    htmlFor="assignment-title"
                    className="mb-2 block text-sm font-medium text-slate-200"
                >
                    Assignment title <span className="text-rose-400">*</span>
                </label>

                <input
                    id="assignment-title"
                    type="text"
                    required
                    maxLength={150}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Data Structures — Assignment 1"
                    className="w-full rounded-xl border border-slate-700 bg-[#0b0e14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400"
                />
                </div>

                {/* Description */}
                <div>
                <label
                    htmlFor="assignment-description"
                    className="mb-2 block text-sm font-medium text-slate-200"
                >
                    Instructions <span className="text-rose-400">*</span>
                </label>

                <textarea
                    id="assignment-description"
                    required
                    rows={4}
                    maxLength={5000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the task, requirements, and submission guidelines..."
                    className="w-full resize-y rounded-xl border border-slate-700 bg-[#0b0e14] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400"
                />
                <p className="mt-1.5 text-right text-xs text-slate-500">
                    {description.length}/5000
                </p>
                </div>

                {/* Deadline */}
                <div>
                <label
                    htmlFor="assignment-due-date"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200"
                >
                    <CalendarDays size={16} className="text-violet-300" />
                    Due date <span className="text-rose-400">*</span>
                </label>

                <input
                    id="assignment-due-date"
                    type="date"
                    required
                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 10)}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-[#0b0e14] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 [color-scheme:dark]"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                    Choose today or a future date.
                </p>
                </div>

                {/* Reference link */}
                <div>
                <label
                    htmlFor="assignment-link"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200"
                >
                    <Link2 size={16} className="text-violet-300" />
                    Resource link
                    <span className="text-xs font-normal text-slate-500">
                    (optional)
                    </span>
                </label>

                <input
                    id="assignment-link"
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-700 bg-[#0b0e14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400"
                />
                </div>

                {/* File upload */}
                <div>
                <label
                    htmlFor="assignment-file"
                    className="mb-2 block text-sm font-medium text-slate-200"
                >
                    Attachment
                    <span className="ml-2 text-xs font-normal text-slate-500">
                    (optional)
                    </span>
                </label>

                <label
                    htmlFor="assignment-file"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-[#0b0e14] px-4 py-6 text-center transition hover:border-violet-400/60 hover:bg-violet-500/[0.04]"
                >
                    <FileUp size={23} className="mb-2 text-violet-300" />

                    <span className="text-sm font-medium text-slate-200">
                    {file ? file.name : "Choose a file to upload"}
                    </span>

                    <span className="mt-1 text-xs text-slate-500">
                    {file
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                        : "Select a document or other supported file"}
                    </span>

                    <input
                    id="assignment-file"
                    type="file"
                    className="sr-only"
                    onChange={(e) =>
                        setFile(e.target.files?.[0] ?? null)
                    }
                    />
                </label>

                {file && (
                    <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200"
                    >
                    <X size={13} />
                    Remove attachment
                    </button>
                )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-[#11151e] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button
                type="button"
                disabled={load}
                onClick={() =>
                    document.getElementById("createAssignment")?.close()
                }
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                Cancel
                </button>

                <button
                type="submit"
                disabled={load}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                {load ? (
                    <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                    </>
                ) : (
                    <>
                    <Plus size={17} />
                    Create assignment
                    </>
                )}
                </button>
            </div>
            </form>
        </div>

        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop bg-black/75">
            <button aria-label="Close modal">Close</button>
        </form>
        </dialog>

        {/**viewing groups */}
        <dialog id="my_modal_2" className="modal">
        <div className="modal-box flex max-h-[85vh] w-11/12 max-w-3xl flex-col overflow-hidden border border-slate-700 bg-[#0e1118] p-0 text-slate-100">

            {/* Header */}
            <div className="shrink-0 border-b border-slate-800 p-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-indigo-300">
                    <Users size={17} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Assignment overview</span>
                </div>
                <h3 className="break-words text-xl font-semibold">{selectedAssignment?.title || "Assignment details"}</h3>
                <p className="mt-1 text-sm text-slate-400">{selectedAssignment?.description || "No description available"}</p>
                {selectedAssignment?.fileUrl && (
                    <a href={selectedAssignment.fileUrl} download={`${selectedAssignment.title || "Assignment"} details.pdf`} className="mt-2 inline-block text-sm text-slate-300 underline underline-offset-4 hover:text-violet-400">
                    Download details of assignment
                    </a>
                )}
                </div>
                <form method="dialog">
                <button type="submit" aria-label="Close modal" className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white">
                    <X size={18} />
                </button>
                </form>
            </div>

            {/* Summary */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-sm">
                <Users size={17} className="text-indigo-400" />
                <span className="text-slate-400">Groups</span>
                <span className="font-semibold">{selectedAssignment?.groups?.length ?? 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                <GraduationCap size={18} className="text-emerald-400" />
                <span className="text-slate-400">Students</span>
                <span className="font-semibold">
                    {selectedAssignment?.groups?.reduce((total: number, group: any) => total + (group.members?.length ?? 0), 0) ?? 0}
                </span>
                </div>
            </div>
            </div>

            {/* Groups */}
            <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                <h4 className="text-sm font-semibold">Group directory</h4>
                <p className="mt-1 text-xs text-slate-500">Teams linked to this assignment</p>
                </div>
                <button type="button" onClick={() => document.getElementById("createGroup")?.showModal()} className="rounded-lg border border-green-700 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/10">
                + Create group
                </button>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                {selectedAssignment?.groups?.length > 0 ? (
                selectedAssignment.groups.map((group: any) => {
                    const leader = findLeader(group.members, group.leader);

                    return (
                    <div key={group._id} className="rounded-lg border border-slate-800 bg-[#131823] p-3 transition-colors hover:border-slate-700 sm:px-4">
                        <div className="flex flex-wrap items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                            <Users size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h5 className="break-words text-sm font-semibold">{group.name}</h5>
                            <p className="mt-1 text-xs text-slate-500">{group.members?.length ?? 0} students</p>
                        </div>

                        <div className="min-w-0 text-xs text-slate-400">
                            <span className="text-slate-500">Leader: </span>
                            <span className="font-medium text-blue-400">{leader?.username || "Not found"}</span>
                        </div>

                        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${group.AssignTask ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>
                            <span className={`size-1.5 rounded-full ${group.AssignTask ? "bg-emerald-400" : "bg-amber-400"}`} />
                            {group.AssignTask ? "Assigned" : "Pending"}
                        </span>
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
                        <button type="button" onClick={() => { setSelectedGroup(group); document.getElementById("studentDetails")?.showModal(); }} className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
                            View students ({group.members?.length ?? 0})
                        </button>
                        </div>
                    </div>
                    );
                })
                ) : (
                <div className="rounded-lg border border-dashed border-slate-700 px-4 py-10 text-center">
                    <Users size={24} className="mx-auto text-slate-500" />
                    <h5 className="mt-3 text-sm font-semibold text-slate-200">No groups assigned yet</h5>
                    <p className="mt-1 text-xs text-slate-500">Groups linked to this assignment will appear here.</p>
                </div>
                )}
            </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-800 px-5 py-4 sm:px-6">
            <p className="hidden text-xs text-slate-500 sm:block">Assignment group overview</p>
            <form method="dialog" className="ml-auto">
                <button type="submit" className="rounded-lg border border-slate-700 px-5 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
                Close
                </button>
            </form>
            </div>
        </div>

        <form method="dialog" className="modal-backdrop bg-black/75">
            <button type="submit" aria-label="Close modal">Close</button>
        </form>
        </dialog>


        {/**Modal for showing students data */}
        <dialog id="studentDetails" className="modal">
        <div className="modal-box w-11/12 max-w-xl border border-base-300 p-0">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-base-300 p-5">
            <div>
                <h3 className="text-lg font-bold">
                Group Members
                </h3>
                <p className="mt-1 text-sm opacity-60">
                {selectedGroup?.name || "Selected group"} ·{" "}
                {selectedGroup?.members?.length ?? 0} members
                </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-xl bg-base-200">
                <Users size={20} />
            </div>
            </div>

            {/* Members list */}
            <div className="p-4">
            <ul className="list bg-base-100 rounded-box">
                <li className="p-4 pb-2 text-xs font-semibold uppercase tracking-wide opacity-60">
                Students in this group
                </li>

                {selectedGroup?.members?.length > 0 ? (
                selectedGroup.members.map((member: any) => {
                    const isLeader =
                    String(selectedGroup.leader) === String(member._id);

                    return (
                    <li
                        key={member._id}
                        className="list-row items-center"
                    >
                        {/* Profile image */}
                        <div>
                        <img
                            className="size-12 rounded-box object-cover"
                            src={
                            member.ProfileImage ||
                            "https://ui-avatars.com/api/?name=Student&background=e5e7eb&color=374151"
                            }
                            alt={`${member.username || "Student"} profile`}
                        />
                        </div>

                        {/* Member information */}
                        <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="break-words font-semibold">
                            {member.username || "Unknown user"}
                            </span>

                            {isLeader && (
                            <span className="badge badge-sm badge-primary">
                                <Crown size={12} className="mr-1" />
                                Leader
                            </span>
                            )}
                        </div>

                        <div className="mt-1 break-all text-xs opacity-60">
                            {member.email || "No email available"}
                        </div>
                        </div>
                    </li>
                    );
                })
                ) : (
                <li className="p-6 text-center text-sm opacity-60">
                    No members found in this group.
                </li>
                )}
            </ul>
            </div>

            {/* Footer */}
            <div className="modal-action mt-0 border-t border-base-300 p-4">
            <form method="dialog">
                <button type="submit" className="btn btn-sm">
                Close
                </button>
            </form>
            </div>
        </div>

        {/* Backdrop */}
        <form method="dialog" className="modal-backdrop">
            <button type="submit" aria-label="Close modal">
            Close
            </button>
        </form>
        </dialog>
        {/** send alert modal */}
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
        {/** Create group */}
        <dialog id="createGroup" className="modal">
            <div className="modal-box max-w-4xl w-[95vw] p-0 rounded-2xl overflow-hidden bg-base-100 border border-base-300 max-h-[92vh]">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void createGroup();
                    }}
                    className="flex flex-col max-h-[92vh]">

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
        </main>
    );
};

export default MyAssignments;
