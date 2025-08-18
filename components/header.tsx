import { Globe } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

function Header() {
    return (
        <nav className="border-b border-border bg-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-2">
                        <Globe className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-semibold text-foreground">CloneX AI Agent CLI</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Header;
