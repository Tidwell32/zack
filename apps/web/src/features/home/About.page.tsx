import { ClippedCard } from '@/components/ui/ClippedCard';
import { SkillBar } from '@/components/ui/SkillBar';
import { Typography } from '@/components/ui/Typography';
import { COLORS } from '@/utils';

export const About = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full font-mono">
      <ClippedCard className="w-full">
        <Typography as="h2" variant="h2" className="text-primary text-start">
          Tech Skills
        </Typography>
        <div className="flex flex-col gap-2 mt-2 pb-2 md:pb-0">
          <SkillBar label="Typescript" level={8} isPrimary />
          <SkillBar label="React" level={9} isPrimary />
          <SkillBar label="Ruby on Rails" level={5} isPrimary />
          <SkillBar label="C#" level={6} isPrimary />
          <SkillBar label="Python" level={4} isPrimary />
          <SkillBar label="Design" level={0} isPrimary />
        </div>
      </ClippedCard>

      <ClippedCard borderColor={COLORS.secondary} className="w-full">
        <Typography as="h2" variant="h2" className="text-secondary text-start">
          Life Skills
        </Typography>
        <div className="flex flex-col gap-2 pb-2 md:pb-0 mt-2">
          <SkillBar label="Disc Golf" level={6} isPrimary={false} />
          <SkillBar label="Golf" level={4} isPrimary={false} />
          <SkillBar label="Cooking" level={7} isPrimary={false} />
          <SkillBar label="Community Building" level={8} isPrimary={false} />
          <SkillBar label="Gardening" level={6} isPrimary={false} />
          <SkillBar label="Chillin'" level={10} isPrimary={false} />
        </div>
      </ClippedCard>
    </div>
  );
};
