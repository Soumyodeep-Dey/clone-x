"use client"

import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import Footer from "@/components/footer"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popup } from "@/components/ui/popup"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Globe, Clock, CheckCircle, Loader2, Brain } from "lucide-react"
import { deleteProject } from "@/lib/utils"
import { AIThinking } from "@/components/ai-thinking"

interface ClonedProject {
  id: string
  name: string
  url: string
  status: "pending" | "in-progress" | "completed"
  createdAt: string
}

export default function Dashboard() {
  const [url, setUrl] = useState("")
  const [projects, setProjects] = useState<ClonedProject[]>([])
  const [deletePopup, setDeletePopup] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [showAIThinking, setShowAIThinking] = useState(false)
  const [currentCloningUrl, setCurrentCloningUrl] = useState("")

  // ✅ Load projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch("/api/projects")
      const data = await res.json()
      setProjects(data)
    }
    fetchProjects()
  }, [])

  const handleCloneWebsite = async () => {
    if (!url.trim()) return

    // Normalize and validate URL to avoid client-side exceptions
    const normalizedUrl = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`
    let hostname = ""
    try {
      hostname = new URL(normalizedUrl).hostname.replace("www.", "")
    } catch {
      window.alert("Please enter a valid URL (e.g., https://example.com)")
      return
    }

    const newProject: ClonedProject = {
      id: Date.now().toString(),
      name: hostname,
      url: normalizedUrl,
      status: "in-progress",
      createdAt: "Just now",
    }

    // Show immediately in UI
    setProjects((prev) => [newProject, ...prev])
    setCurrentCloningUrl(normalizedUrl)
    setShowAIThinking(true)
    setUrl("")
  }

  const handleAIComplete = async (success: boolean) => {
    setShowAIThinking(false)
    
    // Update the project status
    setProjects((prev) =>
      prev.map((p) => (p.url === currentCloningUrl ? { ...p, status: success ? "completed" : "pending" } : p))
    )

    // Save to persistent store
    const projectToUpdate = projects.find(p => p.url === currentCloningUrl)
    if (projectToUpdate) {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...projectToUpdate, status: success ? "completed" : "pending" }),
      })
    }
  }

  const handleDeleteProject = async (id: string) => {
    // Find the project to get its name
    const projectToDelete = projects.find((p) => p.id === id)
    const result = await deleteProject({ id })
    let folderDeleted = false
    let folderError = ""
    if (projectToDelete) {
      try {
        const res = await fetch("/api/delete-folder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderName: projectToDelete.name }),
        })
        const data = await res.json()
        folderDeleted = data.success
        folderError = data.error || ""
      } catch (err) {
        folderError = "Failed to delete folder"
      }
    }
    if (result.success && (folderDeleted || !projectToDelete)) {
      setProjects((prev) => {
        const updated = prev.filter((project) => project.id !== id)
        localStorage.setItem("clonedProjects", JSON.stringify(updated))
        return updated
      })
    } else {
      let errorMsg = result.error || "Failed to delete project"
      if (!folderDeleted && folderError) {
        errorMsg += `\n${folderError}`
      }
      // Show error in popup
      window.alert(errorMsg)
    }
    setDeletePopup({ open: false, id: null })
  }

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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Hero Section */}
        <HeroSection />
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="pb-4">
            <CardTitle className="text-left text-xl sm:text-2xl">Clone a Website</CardTitle>
            <CardDescription className="text-left text-sm sm:text-base">
              Enter a website URL to clone it locally with full functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCloneWebsite()}
                className="flex-1 text-base sm:text-lg px-3 sm:px-4 py-2 sm:py-3"
              />
              <Button
                onClick={handleCloneWebsite}
                disabled={!url.trim()}
                className="px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg whitespace-nowrap"
              >
                <Brain className="h-4 w-4 mr-2" />
                Clone Website
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Section */}
        <div className="space-y-6 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-2xl sm:text-3xl font-semibold text-foreground">Cloned Projects</h3>
            <Badge variant="secondary" className="text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 w-fit">
              {projects.length} projects
            </Badge>
          </div>

          {projects.length === 0 ? (
            <Card className="w-full max-w-4xl mx-auto">
              <CardContent className="py-12 sm:py-16 text-center">
                <Globe className="h-12 sm:h-16 w-12 sm:w-16 text-muted-foreground mx-auto mb-4 sm:mb-6" />
                <p className="text-base sm:text-lg text-muted-foreground">
                  No projects yet. Clone your first website above!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 w-full">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow w-full">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                          <h4 className="text-lg sm:text-xl lg:text-2xl font-medium text-foreground capitalize truncate">
                            {project.name}
                          </h4>
                          <Badge
                            variant={getStatusColor(project.status)}
                            className="flex items-center gap-2 text-sm sm:text-base px-2 sm:px-3 py-1 w-fit"
                          >
                            {getStatusIcon(project.status)}
                            {project.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mb-1 sm:mb-2 break-all">
                          {project.url}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Created {project.createdAt}</p>
                      </div>

                      <div className="flex flex-row gap-2 sm:gap-3 lg:gap-4 justify-end lg:justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-transparent"
                          disabled={project.status !== "completed"}
                          onClick={() => window.open(`/preview/${project.name}`, "_blank")}
                          title="Preview site"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-transparent"
                          disabled={project.status !== "completed"}
                          title="Download zip"
                          onClick={async () => {
                            const res = await fetch("/api/download", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ site: project.name }),
                            })
                            const blob = await res.blob()
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = `${project.name}.zip`
                            a.click()
                          }}
                        >
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base"
                          onClick={() => setDeletePopup({ open: true, id: project.id })}
                          title="Delete project"
                        >
                          <span className="font-semibold">Delete</span>
                        </Button>
                        {/* Delete Confirmation Popup */}
                        {deletePopup.open && (
                          <Popup open={deletePopup.open} onClose={() => setDeletePopup({ open: false, id: null })}>
                            <div className="flex flex-col items-center gap-4">
                              <h3 className="text-lg font-semibold">Confirm Delete</h3>
                              <p className="text-base text-muted-foreground">Are you sure you want to delete this project?</p>
                              <div className="flex gap-3 mt-2">
                                <Button variant="outline" onClick={() => setDeletePopup({ open: false, id: null })}>Cancel</Button>
                                <Button variant="destructive" onClick={() => deletePopup.id && handleDeleteProject(deletePopup.id)}>Delete</Button>
                              </div>
                            </div>
                          </Popup>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      {/* AI Thinking Modal */}
      <AIThinking
        isOpen={showAIThinking}
        onClose={() => setShowAIThinking(false)}
        url={currentCloningUrl}
        onComplete={handleAIComplete}
      />
    </div>
  )
}
