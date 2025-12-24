import { Link } from 'react-router';

import { CookingImage, DiscGolfImage, GolfImage, GymImage } from '@/assets';
import { ClippedButton, ClippedCard, SectionDivider, Typography } from '@/components/ui';
import { COLORS } from '@/utils';

export const Playground = () => {
  return (
    <ClippedCard className="mt-4 w-full" borderColor={COLORS.secondary} variant="segmented" accents={['bottom-right']}>
      <div className="h-full w-full">
        <Typography as="h1" variant="display" className="text-primary">
          Playground
        </Typography>
        <Typography variant="monoStat" className="text-primary">
          Little experiments, tools, and overengineered toys I’m building for fun.
        </Typography>

        <div className="flex flex-col gap-4 mt-4">
          <SectionDivider label="NEARLY COMPLETE" />
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <ClippedCard borderWidth={2} clipSize="lg" className="flex-1 md:max-w-64">
              <div className="flex flex-col h-full">
                <img src={DiscGolfImage} alt="Basket" className="h-20 w-auto mx-auto" />
                <Typography variant="h1" className="text-primary mt-4">
                  DISC GOLF
                </Typography>
                <Typography variant="monoStat" className="mb-4">
                  A place to keep track of my discs, rounds, TechDisc stats, and get AI tips.
                </Typography>
                <Link to="/playground/disc-golf/bags" className="mt-auto">
                  <ClippedButton className="w-full" color="secondary">
                    PLAY
                  </ClippedButton>
                </Link>
              </div>
            </ClippedCard>
          </div>

          <SectionDivider label="UNDER CONSTRUCTION" />
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <ClippedCard borderWidth={2} clipSize="lg" className="flex-1 md:max-w-64">
              <div className="flex flex-col h-full">
                <img src={GymImage} alt="Gym" className="h-20 w-auto mx-auto" />
                <Typography variant="h1" className="text-primary mt-4">
                  GYM TRACKER
                </Typography>
                <Typography variant="monoStat" className="mb-4">
                  A dashboard to log workouts, visualize progression, and store form videos.
                </Typography>
                <Link to="/playground/gym" className="mt-auto">
                  <ClippedButton className="w-full" color="secondary">
                    TRACK
                  </ClippedButton>
                </Link>
              </div>
            </ClippedCard>
          </div>

          <SectionDivider label="FUTURE FUN" />
          <div className="flex flex-col md:flex-row gap-4">
            <ClippedCard borderWidth={2} clipSize="lg" className="flex-1 md:max-w-64">
              <div className="flex flex-col h-full">
                <img src={GolfImage} alt="Golf" className="h-20 w-auto mx-auto" />
                <Typography variant="h1" className="text-primary mt-4">
                  "BALL" GOLF
                </Typography>
                <Typography variant="monoStat" className="mb-4">
                  Perhaps a little pocket caddie that tracks my scores and club distances.
                </Typography>
                {/* <Link to="/playground/ball-golf" className="mt-auto"> */}
                <ClippedButton className="w-full mt-auto" color="secondary" disabled>
                  LOOK
                </ClippedButton>
                {/* </Link> */}
              </div>
            </ClippedCard>

            <ClippedCard borderWidth={2} clipSize="lg" className="flex-1 md:max-w-64">
              <div className="flex flex-col h-full">
                <img src={CookingImage} alt="Cooking" className="h-20 w-auto mx-auto" />
                <Typography variant="h1" className="text-primary mt-4">
                  COOKING
                </Typography>
                <Typography variant="monoStat" className="mb-4">
                  This will likely be some sort of AI sous chef that generates shopping lists and builds recipes from
                  multiple sources.
                </Typography>
                {/* <Link to="/playground/cooking" className="mt-auto"> */}
                <ClippedButton className="w-full mt-auto" color="secondary" disabled>
                  COOK
                </ClippedButton>
                {/* </Link> */}
              </div>
            </ClippedCard>
          </div>
        </div>
      </div>
    </ClippedCard>
  );
};
