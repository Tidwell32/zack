import type { Round } from '@/types/udisc';

export const getCourseIdAndName = (round: Round, groupSimilarLayouts: boolean) => ({
  courseId: groupSimilarLayouts ? round.normalizedCourseId : round.courseName + round.layoutName,
  name: groupSimilarLayouts ? round.normalizedCourseName : `${round.courseName} - ${round.layoutName}`,
});

export const getCourses = (rounds: Round[], groupSimilarLayouts: boolean) => {
  const courseMap = new Map<string, string>();
  for (const round of rounds) {
    const { courseId, name } = getCourseIdAndName(round, groupSimilarLayouts);

    if (!courseMap.has(courseId)) {
      courseMap.set(courseId, name);
    }
  }
  return Array.from(courseMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/'${year}`;
};
