"use client";

import { useParams } from "next/navigation";

export default function PreviewPage() {
    const { site } = useParams();

    return (
        <div className="w-full h-screen">
            <iframe
                src={`/api/preview/${site}`}
                className="w-full h-full border-0"
                title={`Preview of ${site}`}
            />
        </div>
    );
}
