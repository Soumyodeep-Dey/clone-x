import * as React from "react"
import { cn } from "@/lib/utils"

interface PopupProps {
    open: boolean
    onClose: () => void
    children: React.ReactNode
    className?: string
}

export function Popup({ open, onClose, children, className }: PopupProps) {
    if (!open) return null
    return (
        <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/40", className)}>
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 relative min-w-[300px] max-w-[90vw]">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-lg font-bold focus:outline-none"
                    aria-label="Close popup"
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    )
}
