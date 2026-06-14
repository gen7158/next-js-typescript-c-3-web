import { notFound } from "next/navigation";
import { LessonContent } from "@/components/lesson/LessonContent";
import { lessonById, lessons } from "@/data/lessons";
import { questionById } from "@/data/questions";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ lessonId: lesson.id }));
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = lessonById[lessonId];
  if (!lesson) notFound();
  const miniQuestions = lesson.miniQuizIds.map((id) => questionById[id]).filter(Boolean);
  return <LessonContent lesson={lesson} miniQuestions={miniQuestions} />;
}
