"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function PreviewPage() {
    const params = useParams();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const site = useMemo(() => {
        const raw = (params as any)?.site;
        return Array.isArray(raw) ? raw[0] : String(raw || "");
    }, [params]);

    if (!mounted || !site) {
        return <div className="w-full h-screen" />;
    }

    return (
        <div className="w-full h-screen">
            <iframe
                key={site}
                src={`/api/preview/${site}`}
                className="w-full h-full border-0"
                title={`Preview of ${site}`}
            />
        </div>
    );
}
