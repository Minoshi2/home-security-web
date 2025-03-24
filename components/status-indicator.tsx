import { cn } from "@/lib/utils"
import type React from "react"

interface StatusIndicatorProps {
    active: boolean
    icon: React.ReactNode
    label: string
    color: "red" | "amber" | "green" | "blue"
}

const colorVariants = {
    red: {
        active: "bg-red-100 text-red-700 border-red-200",
        inactive: "bg-gray-100 text-gray-400 border-gray-200",
    },
    amber: {
        active: "bg-amber-100 text-amber-700 border-amber-200",
        inactive: "bg-gray-100 text-gray-400 border-gray-200",
    },
    green: {
        active: "bg-green-100 text-green-700 border-green-200",
        inactive: "bg-gray-100 text-gray-400 border-gray-200",
    },
    blue: {
        active: "bg-blue-100 text-blue-700 border-blue-200",
        inactive: "bg-gray-100 text-gray-400 border-gray-200",
    },
}

export function StatusIndicator({ active, icon, label, color }: StatusIndicatorProps) {
    const colorClasses = colorVariants[color]

    return (
        <div
            className={cn(
                "flex items-center gap-2 p-2 rounded-md border transition-colors w-[200px] m-1",
                active ? colorClasses.active : colorClasses.inactive,
            )}
        >
            <div className={cn("flex-shrink-0", active ? "opacity-100" : "opacity-50")}>{icon}</div>
            <div className="text-sm font-medium">{label}</div>
            <div className="ml-auto">
                <div className={cn("h-2 w-2 rounded-full", active ? `bg-${color}-500 animate-pulse` : "bg-gray-300")}></div>
            </div>
        </div>
    )
}

