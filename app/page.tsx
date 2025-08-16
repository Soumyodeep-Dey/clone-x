"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Download, Eye, Globe, Clock, CheckCircle, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface ClonedProject {
  id: string
  name: string
  url: string
  status: "pending" | "in-progress" | "completed"
  createdAt: string
}

export default function Dashboard() {
  const [url, setUrl] = useState("")
  const [projects, setProjects] = useState<ClonedProject[]>([
    {
      id: "1",
      name: "Vercel Homepage",
      url: "https://vercel.com",
      status: "completed",
      createdAt: "2 hours ago",
    },
    {
      id: "2",
      name: "GitHub Dashboard",
      url: "https://github.com",
      status: "in-progress",
      createdAt: "1 hour ago",
    },
  ])

  const handleCloneWebsite = async () => {
    if (!url.trim()) return;

    const newProject: ClonedProject = {
      id: Date.now().toString(),
      name: new URL(url).hostname.replace("www.", ""),
      url,
      status: "in-progress",
      createdAt: "Just now",
    };

    setProjects((prev) => [newProject, ...prev]);
    setUrl("");

    try {
      const res = await fetch("/api/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      setProjects((prev) =>
        prev.map((p) =>
          p.id === newProject.id
            ? { ...p, status: data.success ? "completed" : "pending" }
            : p
        )
      );
    } catch {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === newProject.id ? { ...p, status: "pending" } : p
        )
      );
    }
  };



  const getStatusIcon = (status: ClonedProject["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in-progress":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ClonedProject["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "in-progress":
        return "default"
      case "completed":
        return "default"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground"> CloneX AI Agent CLI</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4"> CloneX AI Agent CLI</h2>
          <p className="text-xl text-muted-foreground mb-8">Clone any website locally and make it functional</p>

          {/* Clone Input */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-left">Clone a Website</CardTitle>
              <CardDescription className="text-left">
                Enter a website URL to clone it locally with full functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCloneWebsite()}
                  className="flex-1"
                />
                <Button onClick={handleCloneWebsite} disabled={!url.trim()}>
                  Clone Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-foreground">Cloned Projects</h3>
            <Badge variant="secondary">{projects.length} projects</Badge>
          </div>

          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No projects yet. Clone your first website above!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-medium text-foreground capitalize">{project.name}</h4>
                          <Badge variant={getStatusColor(project.status)} className="flex items-center gap-1">
                            {getStatusIcon(project.status)}
                            {project.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{project.url}</p>
                        <p className="text-xs text-muted-foreground">Created {project.createdAt}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={project.status !== "completed"}
                          onClick={() => window.open(`/preview/${project.name}`, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={project.status !== "completed"}
                          onClick={async () => {
                            const res = await fetch("/api/download", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ site: project.name }),
                            });
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${project.name}.zip`;
                            a.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
