import { notFound } from "next/navigation";
import { AdvancedLessonGate } from "@/components/advanced/AdvancedLessonGate";
import { advancedLessonById, advancedLessons } from "@/data/advanced-lessons";

export function generateStaticParams() {
  return advancedLessons.map((lesson) => ({ lessonId: lesson.id }));
}

export default async function AdvancedLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = advancedLessonById[lessonId];
  if (!lesson) notFound();
  return <AdvancedLessonGate lesson={lesson} />;
}
