
import {
    CalendarClock,
    ChartNoAxesColumn,
    GraduationCap,
    House,
    LogOut,
    NotepadText,
    Users,
    X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "../Context/UserContext";

interface SideBarProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBar = ({ open, setOpen }: SideBarProps) => {
    const { loading, logout } = useAppContext();
    const location = useLocation();

    if (loading) {
        return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-950">
            <span className="loading loading-spinner loading-xl text-violet-400" />
        </div>
        );
    }

    const navItems = [
        {
        label: "Home",
        path: "/",
        icon: House,
        },
        {
        label: "My Assignments",
        path: "/myAssignments",
        icon: NotepadText,
        },
        {
        label: "My Groups",
        path: "/myGroups",
        icon: Users,
        },
        {
        label: "Calendar",
        path: "/calendar",
        icon: CalendarClock,
        },
        {
        label: "Analytics",
        path: "/analytics",
        icon: ChartNoAxesColumn,
        },
    ];

    return (
        <>
        {open && (
            <div
            className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
            onClick={() => setOpen(false)}
            />
        )}

        {/* Sidebar */}
        <aside
            className={`
            fixed inset-y-0 left-0 z-50
            flex w-64 flex-col
            border-r border-white/10
            bg-slate-950 px-4 py-5 text-slate-300
            transition-transform duration-300 ease-in-out
            ${open ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            `}
        >
            <div className="flex h-14 items-center justify-between px-2">
                <Link
                    to="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                    <GraduationCap size={24} strokeWidth={2.2} />
                    </div>

                    <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold tracking-tight text-white">
                        Join
                    </span>
                    <span className="text-xl font-bold tracking-tight text-violet-400">
                        Easy
                    </span>
                    </div>
                </Link>

                <button
                    onClick={() => setOpen(false)}
                    aria-label="Close sidebar"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Section label */}
            <div className="mb-3 mt-10 px-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Workspace
            </p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1.5">
            {navItems.map(({ label, path, icon: Icon }) => {
                const isActive =
                path === "/"
                    ? location.pathname === "/"
                    : location.pathname === path ||
                    location.pathname.startsWith(`${path}/`);

                return (
                <Link
                    key={label}
                    to={path}
                    onClick={() => setOpen(false)}
                    className={`
                    group flex items-center gap-3
                    rounded-xl px-3 py-3
                    text-sm font-medium
                    transition-colors duration-200
                    ${
                        isActive
                        ? "bg-violet-500/15 text-violet-300"
                        : "text-slate-400 hover:bg-white/6 hover:text-white"
                    }
                    `}
                >
                    <Icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={
                        isActive
                        ? "text-violet-400"
                        : "text-slate-500 transition-colors group-hover:text-slate-300"
                    }
                    />

                    <span>{label}</span>

                    {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                    )}
                </Link>
                );
            })}
            </nav>

            {/* Bottom section */}
            <div className="mt-auto">
            <div className="mb-3 border-t border-white/10" />

            <button
                onClick={logout}
                className="
                flex w-full items-center gap-3
                rounded-xl px-3 py-3
                text-sm font-medium text-slate-400
                transition-colors duration-200
                hover:bg-red-500/10 hover:text-red-400
                "
            >
                <LogOut size={19} strokeWidth={1.8} />
                <span>Logout</span>
            </button>

            <p className="px-3 pt-4 text-[11px] text-slate-600">
                JoinEasy · Workspace
            </p>
            </div>
        </aside>
        </>
    );
};

export default SideBar;
