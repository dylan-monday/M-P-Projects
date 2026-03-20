"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout";
import { Button, Card, CardContent, StatusBadge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProjectWithRelations } from "../page";

interface DashboardViewProps {
  project: ProjectWithRelations;
  paymentStatus?: string;
  isAdmin: boolean;
}

export function DashboardView({ project, paymentStatus, isAdmin }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "proposal">("dashboard");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleFinalPayment = async () => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          paymentType: "final",
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error("Checkout error:", error);
        alert("Something went wrong. Please try again.");
        return;
      }

      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Calculate milestone progress
  const completedMilestones = project.milestones?.filter((m) => m.completed).length || 0;
  const totalMilestones = project.milestones?.length || 0;
  const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" href={undefined} />
              <div className="hidden md:block">
                <h1 className="font-medium text-foreground">{project.title}</h1>
                <p className="text-sm text-foreground-muted">{project.client?.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={project.status} />
              {isAdmin && (
                <Link href={`/admin/${project.slug}`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-px">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "dashboard"
                  ? "border-accent text-accent"
                  : "border-transparent text-foreground-muted hover:text-foreground"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("proposal")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "proposal"
                  ? "border-accent text-accent"
                  : "border-transparent text-foreground-muted hover:text-foreground"
              }`}
            >
              View Proposal
            </button>
          </div>
        </div>
      </header>

      {/* Payment Success Banner */}
      {paymentStatus === "success" && (
        <div className="bg-success/10 border-b border-success/20 px-4 py-3">
          <p className="text-center text-sm text-success max-w-5xl mx-auto">
            Payment successful! Thank you. We&apos;ll be in touch shortly.
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "dashboard" ? (
          <div className="space-y-8">
            {/* Progress Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Status Card */}
              <Card>
                <CardContent className="space-y-2">
                  <p className="text-sm text-foreground-muted">Project Status</p>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={project.status} />
                    <span className="text-2xl font-semibold">{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Deposit Card */}
              <Card className={project.deposit_paid ? "border-success/30" : "border-warning/30"}>
                <CardContent className="space-y-2">
                  <p className="text-sm text-foreground-muted">Deposit</p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(project.deposit_amount || 0)}
                  </p>
                  {project.deposit_paid ? (
                    <p className="text-sm text-success flex items-center gap-1">
                      <span>✓</span> Paid {project.deposit_paid_at && formatDate(project.deposit_paid_at)}
                    </p>
                  ) : (
                    <p className="text-sm text-warning">Awaiting payment</p>
                  )}
                </CardContent>
              </Card>

              {/* Final Payment Card */}
              <Card className={project.final_paid ? "border-success/30" : ""}>
                <CardContent className="space-y-2">
                  <p className="text-sm text-foreground-muted">Final Payment</p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(project.final_amount || 0)}
                  </p>
                  {project.final_paid ? (
                    <p className="text-sm text-success flex items-center gap-1">
                      <span>✓</span> Paid {project.final_paid_at && formatDate(project.final_paid_at)}
                    </p>
                  ) : project.status === "review" ? (
                    <Button
                      size="sm"
                      onClick={handleFinalPayment}
                      isLoading={isCheckoutLoading}
                      className="mt-2"
                    >
                      Pay Now
                    </Button>
                  ) : (
                    <p className="text-sm text-foreground-subtle">Due on completion</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Milestones */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Milestones</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {project.milestones?.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className="flex items-center gap-4 p-4"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            milestone.completed
                              ? "bg-success/20 text-success"
                              : "bg-surface-800 text-foreground-subtle"
                          }`}
                        >
                          {milestone.completed ? "✓" : index + 1}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              milestone.completed ? "text-foreground" : "text-foreground-muted"
                            }`}
                          >
                            {milestone.title}
                          </p>
                          {milestone.completed_at && (
                            <p className="text-xs text-foreground-subtle">
                              Completed {formatDate(milestone.completed_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Deliverables */}
            {project.deliverables && project.deliverables.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Deliverables</h2>
                <div className="grid gap-4">
                  {project.deliverables.map((deliverable) => (
                    <Card key={deliverable.id}>
                      <CardContent className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{deliverable.title}</p>
                          {deliverable.description && (
                            <p className="text-sm text-foreground-muted">
                              {deliverable.description}
                            </p>
                          )}
                          <p className="text-xs text-foreground-subtle mt-1">
                            Added {formatDate(deliverable.created_at)}
                          </p>
                        </div>
                        {deliverable.url && (
                          <a
                            href={deliverable.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline text-sm"
                          >
                            View →
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Notes */}
            {project.notes && project.notes.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Updates</h2>
                <div className="space-y-4">
                  {project.notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent>
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-sm">{note.author || "Dylan"}</p>
                          <p className="text-xs text-foreground-subtle">
                            {formatDate(note.created_at)}
                          </p>
                        </div>
                        <p className="text-foreground-muted whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Contact */}
            <section className="text-center py-8 border-t border-border">
              <p className="text-sm text-foreground-muted mb-2">Questions about your project?</p>
              <p className="text-foreground">
                Email{" "}
                <a href="mailto:dylan@mondayandpartners.com" className="text-accent hover:underline">
                  dylan@mondayandpartners.com
                </a>
              </p>
            </section>
          </div>
        ) : (
          /* Proposal Tab - Embed iframe or show simplified view */
          <div className="text-center py-16">
            <p className="text-foreground-muted mb-4">
              View the original proposal for this project.
            </p>
            <Button variant="secondary" onClick={() => window.open(`/${project.slug}/proposal`, "_blank")}>
              Open Proposal
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border mt-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" href={undefined} />
          <p className="text-xs text-foreground-subtle">
            © 2026 Monday + Partners. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
