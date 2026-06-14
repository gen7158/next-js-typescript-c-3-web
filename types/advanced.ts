import type { Lesson } from "@/types/lesson";

export type AdvancedStageId = "c-practical" | "algorithms" | "memory" | "systems" | "portfolio";

export type AdvancedLesson = Lesson & {
  stage: AdvancedStageId;
  stageOrder: number;
  careerSkill: string;
  deliverable: string;
};

export type AdvancedStage = {
  id: AdvancedStageId;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  color: "primary" | "cyan" | "warning" | "success";
};
