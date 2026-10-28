import { NotebookText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
    assignmentCount: number;
    title: string;
    iconBgColor?: string;
    iconColor?: string;
    icon?: LucideIcon;
};

const Card = ({
    assignmentCount,
    title,
    iconBgColor = "bg-purple-500/10",
    iconColor = "text-purple-400",
    icon: Icon = NotebookText,
}: Props) => {
    return (
    <div
        className="
            w-full
            rounded-2xl
            border border-white/10
            bg-white/[0.03]
            p-4 sm:p-5
            transition-all duration-200
            hover:border-white/20
            hover:bg-white/[0.05]
        "
        >
        <div className="flex items-center justify-between gap-4">

            {/* Text */}
            <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-400">
                {title}
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {assignmentCount}
            </h3>
            </div>

            {/* Icon */}
            <div
            className={`
                flex shrink-0
                h-11 w-11 sm:h-12 sm:w-12
                items-center justify-center
                rounded-xl
                ${iconBgColor}
            `}
            >
            <Icon
                className={`${iconColor} h-5 w-5 sm:h-6 sm:w-6`}
            />
            </div>

        </div>
        </div>
    );
};

export default Card;
