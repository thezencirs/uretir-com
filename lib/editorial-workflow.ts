export const editorialWorkflowStages = [
  "source_review",
  "entity_review",
  "editorial_review",
  "seo_review",
  "knowledge_graph_review",
  "publication_review",
  "update_review",
] as const;

export type EditorialWorkflowStage = (typeof editorialWorkflowStages)[number];
export type EditorialWorkflowStageStatus = "pending" | "in_progress" | "approved" | "changes_requested" | "blocked" | "scheduled";

export type EditorialWorkflowDecision = {
  stage: EditorialWorkflowStage;
  status: EditorialWorkflowStageStatus;
  reviewer?: string;
  decidedAt?: string;
  dueAt?: string;
  note?: string;
};

export type EditorialWorkflow = {
  contentId: string;
  revisionId: string;
  decisions: EditorialWorkflowDecision[];
};

export type EditorialWorkflowIssue = {
  field: string;
  message: string;
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const publicationStages = editorialWorkflowStages.filter((stage) => stage !== "update_review");

export function getEditorialWorkflowIssues(workflow: EditorialWorkflow, options: { publicationReady?: boolean } = {}): EditorialWorkflowIssue[] {
  const issues: EditorialWorkflowIssue[] = [];
  const byStage = new Map(workflow.decisions.map((decision) => [decision.stage, decision]));
  if (!/^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9:-]*$/.test(workflow.contentId)) {
    issues.push({ field: "contentId", message: "Workflow content ID must be a stable namespaced identifier." });
  }
  if (!/^[a-z0-9][a-z0-9._-]{2,79}$/.test(workflow.revisionId)) {
    issues.push({ field: "revisionId", message: "Workflow revision ID must be stable and machine-readable." });
  }
  if (byStage.size !== workflow.decisions.length) {
    issues.push({ field: "decisions", message: "A workflow stage can have only one current decision." });
  }

  for (const stage of editorialWorkflowStages) {
    const decision = byStage.get(stage);
    if (!decision) {
      issues.push({ field: `decisions.${stage}`, message: `Workflow stage is missing: ${stage}.` });
      continue;
    }
    if (decision.decidedAt && !datePattern.test(decision.decidedAt)) {
      issues.push({ field: `decisions.${stage}.decidedAt`, message: "Decision date must use YYYY-MM-DD." });
    }
    if (decision.dueAt && !datePattern.test(decision.dueAt)) {
      issues.push({ field: `decisions.${stage}.dueAt`, message: "Review due date must use YYYY-MM-DD." });
    }
    if (["approved", "changes_requested", "blocked"].includes(decision.status) && !decision.reviewer?.trim()) {
      issues.push({ field: `decisions.${stage}.reviewer`, message: "A decision requires an accountable reviewer." });
    }
    if (decision.status === "approved" && !decision.decidedAt) {
      issues.push({ field: `decisions.${stage}.decidedAt`, message: "An approval requires a decision date." });
    }
  }

  if (options.publicationReady) {
    let previousApprovalDate: string | undefined;
    for (const stage of publicationStages) {
      const decision = byStage.get(stage);
      if (decision?.status !== "approved") {
        issues.push({ field: `decisions.${stage}.status`, message: `Publication requires approved ${stage}.` });
        continue;
      }
      if (decision.decidedAt && previousApprovalDate && decision.decidedAt < previousApprovalDate) {
        issues.push({ field: `decisions.${stage}.decidedAt`, message: `${stage} cannot be approved before the preceding workflow stage.` });
      }
      if (decision.decidedAt) previousApprovalDate = decision.decidedAt;
    }
    const updateReview = byStage.get("update_review");
    if (!updateReview || !["approved", "scheduled"].includes(updateReview.status) || !updateReview.dueAt) {
      issues.push({ field: "decisions.update_review", message: "Publication requires a completed or scheduled update review with a due date." });
    } else if (previousApprovalDate && updateReview.dueAt < previousApprovalDate) {
      issues.push({ field: "decisions.update_review.dueAt", message: "Update review cannot be due before publication review approval." });
    }
  }

  return issues;
}

export function isEditorialWorkflowPublicationReady(workflow: EditorialWorkflow) {
  return getEditorialWorkflowIssues(workflow, { publicationReady: true }).length === 0;
}
