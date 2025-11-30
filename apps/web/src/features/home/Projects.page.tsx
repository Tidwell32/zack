import { CrmImage, StonksImage } from '@/assets';
import { ClippedButton } from '@/components/ui/ClippedButton';
import { ClippedCard } from '@/components/ui/ClippedCard';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { Typography } from '@/components/ui/Typography';
import { COLORS } from '@/utils';

export const Projects = () => {
  return (
    <ClippedCard className="mt-4 w-full" borderColor={COLORS.secondary} variant="segmented" accents={['top-left']}>
      <div className="h-full w-full">
        <Typography as="h1" variant="display" className="text-primary">
          Projects
        </Typography>

        <Typography variant="monoStat" className="text-primary">
          Personal projects I've built for fun or money.
        </Typography>

        <div className="flex flex-col gap-4 mt-4">
          <SectionDivider label="STILL LIVE" />
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <ClippedCard borderWidth={2} clipSize="lg" className="flex-1 w-full">
              <ClippedCard
                borderWidth={2}
                variant="segmented"
                className="flex aspect-square h-40 md:h-50  mr-4 float-left"
              >
                <img src={CrmImage} alt="CRM" className="object-cover mx-auto" />
              </ClippedCard>
              <Typography variant="h1" className="text-secondary text-start">
                CRM
              </Typography>
              <Typography variant="monoStat" className="text-start">
                This was my second major project, which was completely rewritten a few years ago. It's a CRM designed to
                a client's specs (shout out to my Dad!). It is designed to be easy to navigate, map out contacts, and
                has a very powerful search function. He's been using it daily for years and is consistently the top
                salesperson at his companies &#128540;. There are test credentials to try it out yourself! (not yet
                mobile friendly)
              </Typography>
              <Typography variant="monoStat" className="text-primary my-4 clear-both">
                React | React Query | NestJs | Tailwind
              </Typography>
              <a href="https://app.asimplercrm.com/" target="_blank" rel="noopener noreferrer" className="mt-auto">
                <ClippedButton className="w-full md:w-64" color="secondary">
                  EXPLORE
                </ClippedButton>
              </a>
              <Typography variant="monoStat" className="mt-4">
                test@example.com // WeShouldHireThisGuy
              </Typography>
            </ClippedCard>
          </div>

          <SectionDivider label="RETIRED STUFF" />
          <div className="flex flex-col md:flex-row gap-4">
            <ClippedCard borderWidth={2} clipSize="lg" className="flex-1 w-full">
              <ClippedCard
                borderWidth={2}
                variant="segmented"
                className="flex aspect-square h-40 md:h-50 mr-4 float-left"
              >
                <img src={StonksImage} alt="Stonks" className="object-cover mx-auto" />
              </ClippedCard>
              <Typography variant="h1" className="text-secondary text-start">
                STONKS
              </Typography>
              <Typography variant="monoStat" className="text-start">
                This was a silly project during the Gamestop meme stock era. It originally involved a Python web scraper
                that scraped the wallstreetbets subreddit and tracked every stock ticker that was mentioned. It then
                displayed those mentions in a number of different ways in an attempt to capture stocks that were gaining
                traction, theoretically, before they became memes. The APIs no longer work, so I "froze" the website for
                January 2023 data. It's pretty fun, have a look. (also not super mobile friendly, apparently I didn't
                care about that years ago)
              </Typography>
              <Typography variant="monoStat" className="text-primary my-4 clear-both">
                React | GraphQL | NextJS | Python | Recharts
              </Typography>
              <a href="https://wsb-data.vercel.app/" target="_blank" rel="noopener noreferrer" className="mt-auto">
                <ClippedButton className="w-full md:w-64" color="secondary">
                  FIDDLE
                </ClippedButton>
              </a>
            </ClippedCard>
          </div>
        </div>
      </div>
    </ClippedCard>
  );
};
