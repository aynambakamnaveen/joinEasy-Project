
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
    Users,
    Search,
    FileText,
    CheckCircle2,
    Clock3,
    FolderGit2,
    ExternalLink,
    Download,
    CalendarDays,
    ArrowUpRight,
    X,
    ClipboardList,
    ShieldCheck,
    Mail,
    UserRound,
} from "lucide-react";

import { acceptSubmission } from "../Controllers/AcceptSubmission.tsx";
import { useAppContext } from "../Context/UserContext";

type FilterType = "all" | "accepted" | "review";

type DetailType =
    | "group"
    | "assignment"
    | "submitter"
    | "submission"
    | null;

const Submission = () => {
    const { user, loggedIn, loading, submissions } = useAppContext();

    const navigate = useNavigate();

    // States
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");

    const [submissionsList, setSubmissionsList] = useState<any[]>([]);

    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [detailType, setDetailType] = useState<DetailType>(null);

    const [isAccepting, setIsAccepting] = useState(false);

    // Sync context submissions with local state
    useEffect(() => {
        setSubmissionsList(submissions || []);
    }, [submissions]);

    // Authentication
    useEffect(() => {
        if (!loading && !loggedIn) {
            toast.error("Please login to continue");
            navigate("/login");
        }
    }, [loading, loggedIn, navigate]);

    // Summary counts
    const totalSubmissions = submissionsList.length;

    const acceptedSubmissions = submissionsList.filter(
        (item: any) => item.isConfirmedByAdmin === true
    ).length;

    const needsReview = submissionsList.filter(
        (item: any) => item.isConfirmedByAdmin !== true
    ).length;

    // Search and filtering
    const filteredSubmissions = useMemo(() => {
        const query = search.trim().toLowerCase();

        return submissionsList.filter((submission: any) => {
            const accepted = submission.isConfirmedByAdmin === true;

            const matchesFilter =
                activeFilter === "all" ||
                (activeFilter === "accepted" && accepted) ||
                (activeFilter === "review" && !accepted);

            if (!matchesFilter) return false;

            if (!query) return true;

            const searchableFields = [
                submission?.group?.name,
                submission?.assignment?.title,
                submission?.submittedBy?.username,
                submission?.submittedBy?.name,
                submission?.submittedBy?.email,
                submission?.description,
            ];

            return searchableFields.some((field) =>
                String(field || "").toLowerCase().includes(query)
            );
        });
    }, [submissionsList, search, activeFilter]);

    // Date formatting
    const formatDate = (date: string) => {
        if (!date) return "Date unavailable";

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return "Date unavailable";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Open DaisyUI modal
    const openDetails = (submission: any, type: DetailType) => {
        setSelectedSubmission(submission);
        setDetailType(type);

        const modal = document.getElementById(
            "submissionDetailsModal"
        ) as HTMLDialogElement | null;

        if (modal && !modal.open) {
            modal.showModal();
        }
    };

    // Close DaisyUI modal
    const closeDetails = () => {
        const modal = document.getElementById(
            "submissionDetailsModal"
        ) as HTMLDialogElement | null;

        modal?.close();
    };

    // Clear modal state when dialog closes (including Escape)
    const handleModalClose = () => {
        setSelectedSubmission(null);
        setDetailType(null);
    };

    // Accept submission
    const handleAcceptSubmission = async (submission: any) => {
        if (submission.isConfirmedByAdmin === true) {
            toast.success("This submission is already accepted");
            return;
        }

        if (isAccepting) return;

        if (!submission._id || !submission.group?._id) {
            toast.error("Submission or group ID is missing");
            return;
        }

        try {
            await acceptSubmission(
                submission._id,
                submission.group._id,
                setIsAccepting
            );

            // Update local submission list
            setSubmissionsList((prev) =>
                prev.map((item) =>
                    item._id === submission._id
                        ? {
                              ...item,
                              isConfirmedByAdmin: true,
                          }
                        : item
                )
            );

            // Update currently selected submission
            setSelectedSubmission((prev: any) =>
                prev?._id === submission._id
                    ? {
                          ...prev,
                          isConfirmedByAdmin: true,
                      }
                    : prev
            );

            toast.success("Submission accepted successfully!");

        } catch (error: any) {
            console.error("Accept submission error:", error);

            toast.error(
                error?.response?.data?.message ||
                    "Failed to accept submission"
            );
        }
    };

    // Status badge
    const StatusBadge = ({ accepted }: { accepted: boolean }) => (
        <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                accepted
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-400"
            }`}
        >
            {accepted ? (
                <CheckCircle2 size={13} />
            ) : (
                <Clock3 size={13} />
            )}

            {accepted ? "Accepted" : "Needs review"}
        </span>
    );

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0b0d12]">
                <div className="size-7 animate-spin rounded-full border-2 border-slate-700 border-t-violet-400" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0b0d12] text-slate-100">

            {/* HEADER */}
            <header className="border-b border-white/[0.07]">
                <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                            <Users size={20} />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold">
                                Teacher Portal
                            </h2>

                            <p className="text-xs text-slate-500">
                                Group management
                            </p>
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

                {/* PAGE HEADING */}
                <section>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                        Workspace
                    </p>

                    <h1 className="text-2xl font-semibold sm:text-3xl">
                        Submissions
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Review student submissions, explore assignments and track team progress.
                    </p>
                </section>

                {/* SUMMARY CARDS */}
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                    {[
                        {
                            label: "Total submissions",
                            count: totalSubmissions,
                            icon: FileText,
                            color: "text-violet-300",
                        },
                        {
                            label: "Accepted submissions",
                            count: acceptedSubmissions,
                            icon: CheckCircle2,
                            color: "text-emerald-300",
                        },
                        {
                            label: "Needs review",
                            count: needsReview,
                            icon: Clock3,
                            color: "text-amber-300",
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

                {/* SUBMISSION DIRECTORY */}
                <section className="overflow-visible rounded-xl border border-white/[0.07] bg-[#11141c]">

                    {/* TOP BAR */}
                    <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:px-5 sm:py-5">

                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                            <div>
                                <h2 className="font-semibold">
                                    Submission directory
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    {filteredSubmissions.length} submissions found
                                </p>
                            </div>

                            {/* SEARCH */}
                            <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-white/[0.09] bg-[#0b0d12] px-3 lg:max-w-sm">
                                <Search
                                    size={16}
                                    className="shrink-0 text-slate-500"
                                />

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search submissions..."
                                    className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-600"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="text-slate-500 hover:text-white"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </label>

                        </div>

                        {/* FILTER TABS */}
                        <div className="flex flex-wrap items-center gap-2">

                            {[
                                {
                                    id: "all",
                                    label: "All submissions",
                                    count: totalSubmissions,
                                },
                                {
                                    id: "accepted",
                                    label: "Accepted",
                                    count: acceptedSubmissions,
                                },
                                {
                                    id: "review",
                                    label: "Needs review",
                                    count: needsReview,
                                },
                            ].map((filter) => (
                                <button
                                    key={filter.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveFilter(filter.id as FilterType)
                                    }
                                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                                        activeFilter === filter.id
                                            ? "border-violet-400/30 bg-violet-500/10 text-violet-300"
                                            : "border-white/[0.07] bg-[#0b0d12] text-slate-400 hover:border-white/20 hover:text-white"
                                    }`}
                                >
                                    {filter.label}

                                    <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px]">
                                        {filter.count}
                                    </span>
                                </button>
                            ))}

                        </div>

                    </div>

                    {/* SUBMISSION LIST */}
                    {filteredSubmissions.length > 0 ? (

                        <div className="divide-y divide-white/[0.06]">

                            {filteredSubmissions.map((submission: any) => {

                                const accepted =
                                    submission.isConfirmedByAdmin === true;

                                const assignment = submission.assignment;
                                const group = submission.group;
                                const leader = submission.submittedBy;

                                return (
                                    <article
                                        key={submission._id}
                                        className="space-y-4 p-4 transition-colors hover:bg-white/[0.015] sm:px-5 sm:py-5"
                                    >

                                        {/* TOP ROW */}
                                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

                                            <div className="flex min-w-0 items-start gap-3">

                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                                                    <FileText size={19} />
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="truncate text-sm font-semibold">
                                                        {assignment?.title || "Untitled assignment"}
                                                    </h3>

                                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">

                                                        <span className="flex items-center gap-1">
                                                            <Users size={12} />
                                                            {group?.name || "Unknown group"}
                                                        </span>

                                                        <span className="flex items-center gap-1">
                                                            <CalendarDays size={12} />
                                                            {formatDate(submission.createdAt)}
                                                        </span>

                                                    </div>
                                                </div>

                                            </div>

                                            <StatusBadge accepted={accepted} />

                                        </div>

                                        {/* DETAILS */}
                                        <div className="grid grid-cols-1 gap-3 rounded-lg border border-white/[0.05] bg-[#0d1017] p-3 sm:grid-cols-3">

                                            {/* GROUP */}
                                            <div className="min-w-0">
                                                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                                                    Group
                                                </p>

                                                <p className="mt-1 truncate text-sm font-medium text-slate-200">
                                                    {group?.name || "Unknown group"}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDetails(submission, "group")
                                                    }
                                                    className="mt-1 text-xs text-violet-300 hover:text-violet-200"
                                                >
                                                    View group details →
                                                </button>
                                            </div>

                                            {/* ASSIGNMENT */}
                                            <div className="min-w-0">
                                                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                                                    Assignment
                                                </p>

                                                <p className="mt-1 truncate text-sm font-medium text-slate-200">
                                                    {assignment?.title || "Untitled"}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDetails(submission, "assignment")
                                                    }
                                                    className="mt-1 text-xs text-violet-300 hover:text-violet-200"
                                                >
                                                    View assignment →
                                                </button>
                                            </div>

                                            {/* SUBMITTED BY */}
                                            <div className="min-w-0">
                                                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                                                    Submitted by
                                                </p>

                                                <p className="mt-1 truncate text-sm font-medium text-blue-400">
                                                    {leader?.username ||
                                                        leader?.name ||
                                                        "Unknown leader"}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDetails(submission, "submitter")
                                                    }
                                                    className="mt-1 text-xs text-violet-300 hover:text-violet-200"
                                                >
                                                    View leader details →
                                                </button>
                                            </div>

                                        </div>

                                        {/* DESCRIPTION */}
                                        {submission.description && (
                                            <p className="line-clamp-2 text-xs leading-5 text-slate-400">
                                                {submission.description}
                                            </p>
                                        )}

                                        {/* FOOTER */}
                                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                                            <div className="flex flex-wrap items-center gap-2">

                                                {submission.gitHubLink && (
                                                    <a
                                                        href={submission.gitHubLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
                                                    >
                                                        <FolderGit2 size={14} />
                                                        GitHub
                                                        <ArrowUpRight size={12} />
                                                    </a>
                                                )}

                                                {submission.liveLink && (
                                                    <a
                                                        href={submission.liveLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
                                                    >
                                                        <ExternalLink size={14} />
                                                        Live project
                                                    </a>
                                                )}

                                                {/* VIEW SUBMISSION */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDetails(submission, "submission")
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-300 hover:bg-violet-500/20"
                                                >
                                                    <FileText size={14} />
                                                    View submission
                                                </button>

                                            </div>

                                            {/* ACCEPT BUTTON */}
                                            <div className="flex flex-wrap items-center gap-2">

                                                {accepted ? (

                                                    <button
                                                        type="button"
                                                        disabled
                                                        className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400"
                                                    >
                                                        <CheckCircle2 size={15} />
                                                        Accepted
                                                    </button>

                                                ) : (

                                                    <button
                                                        type="button"
                                                        disabled={isAccepting}
                                                        onClick={() =>
                                                            handleAcceptSubmission(submission)
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {isAccepting ? (
                                                            <>
                                                                <span className="loading loading-spinner loading-xs" />
                                                                Accepting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 size={15} />
                                                                Accept submission
                                                            </>
                                                        )}
                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>

                    ) : (

                        /* EMPTY STATE */
                        <div className="flex flex-col items-center px-5 py-16 text-center">

                            <div className="flex size-14 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                                {search ? (
                                    <Search size={24} />
                                ) : (
                                    <ClipboardList size={24} />
                                )}
                            </div>

                            <h3 className="mt-4 font-medium">
                                {search
                                    ? "No matching submissions"
                                    : activeFilter === "accepted"
                                        ? "No accepted submissions"
                                        : activeFilter === "review"
                                            ? "No submissions need review"
                                            : "No submissions found"}
                            </h3>

                            <p className="mt-2 max-w-sm text-sm text-slate-500">
                                {search
                                    ? "Try searching with another group, assignment or leader name."
                                    : "Student submissions will appear here once group leaders submit their assignments."}
                            </p>

                            {(search || activeFilter !== "all") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setActiveFilter("all");
                                    }}
                                    className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs text-violet-300 hover:bg-white/[0.04]"
                                >
                                    Clear filters
                                </button>
                            )}

                        </div>

                    )}

                </section>

            </div>

            {/* DAISYUI SUBMISSION DETAILS MODAL */}
            <dialog
                id="submissionDetailsModal"
                className="modal modal-bottom sm:modal-middle"
                onClose={handleModalClose}
            >

                <div className="modal-box max-h-[85vh] max-w-2xl border border-white/[0.09] bg-[#11141c] p-0 text-slate-100">

                    {/* MODAL HEADER */}
                    <div className="flex items-center justify-between border-b border-white/[0.07] p-5">

                        <div>
                            <h3 className="text-lg font-semibold">
                                {detailType === "group" && "Group details"}
                                {detailType === "assignment" && "Assignment details"}
                                {detailType === "submitter" && "Leader information"}
                                {detailType === "submission" && "Submission details"}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Review submission information
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={closeDetails}
                            className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white"
                        >
                            <X size={18} />
                        </button>

                    </div>

                    {/* MODAL BODY */}
                    <div className="max-h-[60vh] space-y-5 overflow-y-auto p-5">

                        {selectedSubmission && (
                            <>

                                {/* COMPLETE SUBMISSION DETAILS */}
                                {detailType === "submission" && (

                                    <div className="space-y-5">

                                        {/* STATUS AND DATE */}
                                        <div className="flex flex-wrap items-center justify-between gap-3">

                                            <StatusBadge
                                                accepted={
                                                    selectedSubmission.isConfirmedByAdmin === true
                                                }
                                            />

                                            <span className="text-xs text-slate-500">
                                                Submitted: {formatDate(selectedSubmission.createdAt)}
                                            </span>

                                        </div>

                                        {/* ASSIGNMENT TITLE */}
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                                Assignment
                                            </p>

                                            <h4 className="mt-1 text-lg font-semibold">
                                                {selectedSubmission.assignment?.title ||
                                                    "Untitled assignment"}
                                            </h4>
                                        </div>

                                        {/* GROUP AND LEADER */}
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                            <div className="rounded-lg border border-white/[0.07] bg-[#0d1017] p-4">

                                                <p className="text-xs text-slate-500">
                                                    Group
                                                </p>

                                                <p className="mt-2 text-sm font-semibold">
                                                    {selectedSubmission.group?.name ||
                                                        "Unknown group"}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDetails(selectedSubmission, "group")
                                                    }
                                                    className="mt-2 text-xs text-violet-300 hover:text-violet-200"
                                                >
                                                    View group →
                                                </button>

                                            </div>

                                            <div className="rounded-lg border border-white/[0.07] bg-[#0d1017] p-4">

                                                <p className="text-xs text-slate-500">
                                                    Submitted by
                                                </p>

                                                <p className="mt-2 text-sm font-semibold">
                                                    {selectedSubmission.submittedBy?.username ||
                                                        selectedSubmission.submittedBy?.name ||
                                                        "Unknown user"}
                                                </p>

                                                <p className="mt-1 break-all text-xs text-slate-400">
                                                    {selectedSubmission.submittedBy?.email ||
                                                        "No email"}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDetails(selectedSubmission, "submitter")
                                                    }
                                                    className="mt-2 text-xs text-violet-300 hover:text-violet-200"
                                                >
                                                    View leader →
                                                </button>

                                            </div>

                                        </div>

                                        {/* SUBMISSION DESCRIPTION */}
                                        <div>
                                            <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                                                Submission description
                                            </p>

                                            <div className="rounded-lg border border-white/[0.07] bg-[#0d1017] p-4 text-sm leading-6 text-slate-300">
                                                {selectedSubmission.description ||
                                                    "No description provided."}
                                            </div>
                                        </div>

                                        {/* PROJECT LINKS */}
                                        <div className="space-y-2">

                                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                                Project links
                                            </p>

                                            {selectedSubmission.gitHubLink && (
                                                <a
                                                    href={selectedSubmission.gitHubLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-[#0d1017] p-3 text-sm text-slate-300 hover:border-violet-400/30"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <FolderGit2 size={17} />
                                                        GitHub repository
                                                    </span>

                                                    <ExternalLink size={15} />
                                                </a>
                                            )}

                                            {selectedSubmission.liveLink && (
                                                <a
                                                    href={selectedSubmission.liveLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-[#0d1017] p-3 text-sm text-slate-300 hover:border-violet-400/30"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <ExternalLink size={17} />
                                                        Live project
                                                    </span>

                                                    <ArrowUpRight size={15} />
                                                </a>
                                            )}

                                        </div>

                                        {/* CONFIRMATION STATUS */}
                                        <div className="rounded-lg border border-white/[0.07] bg-[#0d1017] p-3">

                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-xs text-slate-400">
                                                    Leader confirmation
                                                </span>

                                                <span
                                                    className={`text-xs font-medium ${
                                                        selectedSubmission.isConfirmedByUser
                                                            ? "text-emerald-400"
                                                            : "text-amber-400"
                                                    }`}
                                                >
                                                    {selectedSubmission.isConfirmedByUser
                                                        ? "Confirmed"
                                                        : "Not confirmed"}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between gap-3">
                                                <span className="text-xs text-slate-400">
                                                    Teacher approval
                                                </span>

                                                <StatusBadge
                                                    accepted={
                                                        selectedSubmission.isConfirmedByAdmin === true
                                                    }
                                                />
                                            </div>

                                        </div>

                                    </div>

                                )}

                                {/* GROUP DETAILS */}
                                {detailType === "group" && (

                                    <div className="space-y-4">

                                        <div className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#0d1017] p-4">

                                            <div className="flex size-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                                                <Users size={21} />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500">
                                                    Group name
                                                </p>

                                                <h4 className="mt-1 font-semibold">
                                                    {selectedSubmission.group?.name ||
                                                        "Unknown group"}
                                                </h4>
                                            </div>

                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Group ID
                                            </p>

                                            <p className="mt-1 break-all text-sm text-slate-300">
                                                {selectedSubmission.group?._id ||
                                                    "Not available"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Submitted assignment
                                            </p>

                                            <p className="mt-1 text-sm text-slate-300">
                                                {selectedSubmission.assignment?.title ||
                                                    "Not available"}
                                            </p>
                                        </div>

                                        <p className="text-xs leading-5 text-slate-500">
                                            The current submission response provides the group ID and name, but not the group members. Fetch the group document separately to display its students.
                                        </p>

                                    </div>

                                )}

                                {/* ASSIGNMENT DETAILS */}
                                {detailType === "assignment" && (

                                    <div className="space-y-4">

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Assignment title
                                            </p>

                                            <h4 className="mt-1 text-lg font-semibold">
                                                {selectedSubmission.assignment?.title ||
                                                    "Untitled assignment"}
                                            </h4>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-xs text-slate-500">
                                                Description
                                            </p>

                                            <div className="rounded-lg border border-white/[0.07] bg-[#0d1017] p-4 text-sm leading-6 text-slate-300">
                                                {selectedSubmission.assignment?.description ||
                                                    "No description provided."}
                                            </div>
                                        </div>

                                        {selectedSubmission.assignment?.fileUrl && (

                                            <a
                                                href={selectedSubmission.assignment.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#0d1017] p-4 transition-colors hover:border-violet-400/30"
                                            >

                                                <div className="flex items-center gap-3">

                                                    <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                                                        <FileText size={19} />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            Assignment attachment
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            Open attached file
                                                        </p>
                                                    </div>

                                                </div>

                                                <Download
                                                    size={17}
                                                    className="text-violet-300"
                                                />

                                            </a>

                                        )}

                                    </div>

                                )}

                                {/* SUBMITTER DETAILS */}
                                {detailType === "submitter" && (

                                    <div className="space-y-4">

                                        <div className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#0d1017] p-4">

                                            <div className="flex size-12 items-center justify-center rounded-full bg-violet-500/10 text-lg font-semibold text-violet-300">
                                                {(selectedSubmission.submittedBy?.username ||
                                                    selectedSubmission.submittedBy?.name ||
                                                    "U")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <h4 className="font-semibold">
                                                    {selectedSubmission.submittedBy?.username ||
                                                        selectedSubmission.submittedBy?.name ||
                                                        "Unknown user"}
                                                </h4>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    Group leader / Submitter
                                                </p>
                                            </div>

                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Username
                                            </p>

                                            <p className="mt-1 text-sm text-slate-200">
                                                {selectedSubmission.submittedBy?.username ||
                                                    "Not available"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Email address
                                            </p>

                                            {selectedSubmission.submittedBy?.email ? (
                                                <a
                                                    href={`mailto:${selectedSubmission.submittedBy.email}`}
                                                    className="mt-1 flex items-center gap-2 break-all text-sm text-blue-400 hover:text-blue-300"
                                                >
                                                    <Mail size={14} />
                                                    {selectedSubmission.submittedBy.email}
                                                </a>
                                            ) : (
                                                <p className="mt-1 text-sm text-slate-400">
                                                    Not available
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                User ID
                                            </p>

                                            <p className="mt-1 break-all text-sm text-slate-300">
                                                {selectedSubmission.submittedBy?._id ||
                                                    "Not available"}
                                            </p>
                                        </div>

                                    </div>

                                )}

                            </>
                        )}

                    </div>

                    {/* MODAL FOOTER */}
                    <div className="flex flex-col-reverse justify-between gap-3 border-t border-white/[0.07] p-4 sm:flex-row sm:items-center">

                        <button
                            type="button"
                            onClick={closeDetails}
                            className="rounded-lg border border-white/[0.1] px-5 py-2 text-sm text-slate-300 hover:bg-white/[0.05]"
                        >
                            Close
                        </button>

                        {/* ACCEPT BUTTON INSIDE MODAL */}
                        {detailType === "submission" && selectedSubmission && (

                            selectedSubmission.isConfirmedByAdmin === true ? (

                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm font-medium text-emerald-400"
                                >
                                    <CheckCircle2 size={16} />
                                    Already accepted
                                </button>

                            ) : (

                                <button
                                    type="button"
                                    disabled={isAccepting}
                                    onClick={() =>
                                        handleAcceptSubmission(selectedSubmission)
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
                                >
                                    {isAccepting ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs" />
                                            Accepting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            Accept submission
                                        </>
                                    )}
                                </button>

                            )

                        )}

                    </div>

                </div>

                {/* DAISYUI BACKDROP */}
                <form method="dialog" className="modal-backdrop">
                    <button aria-label="Close modal">close</button>
                </form>

            </dialog>

        </main>
    );
};

export default Submission;

