// app/preview/[site]/page.tsx
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

export default function PreviewPage({ params }: { params: { site: string } }) {
    const filePath = path.join(process.cwd(), "clones", params.site, "page.tsx");

    if (!fs.existsSync(filePath)) {
        notFound();
    }

    // 🚨 limitation: you can’t directly render raw .tsx, 
    // so we’ll improve later by serving static HTML.
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Preview not yet supported inline</h1>
            <p>But file exists at: {filePath}</p>
        </div>
    );
}
