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
                Retouch CRM
              </Typography>
              <Typography variant="monoStat" className="text-start">
                This solo project is a CRM designed for the individual salesperson. It strips away the complicated
                dashboards and admin overhead of tools like Salesforce in favor of a single workflow: who haven't I
                talked to, and who should I reach out to next. It centers on powerful discoverability, touch-cadence
                tracking, map-based visit planning, and an algorithm-driven hit list that surfaces overdue,
                high-priority contacts. Use the demo credentials to check it out.
              </Typography>
              <Typography variant="monoStat" className="text-primary my-4 clear-both">
                React | Tanstack Query | Tailwind | Fastify | Postgres
              </Typography>
              <a href="https://retouchcrm.app/" target="_blank" rel="noopener noreferrer" className="mt-auto">
                <ClippedButton className="w-full md:w-64" color="secondary">
                  EXPLORE
                </ClippedButton>
              </a>
              <Typography variant="monoStat" className="mt-4">
                hello+demo@tidwellmade.com // Retouch~Demo
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
                Update (6/2/2026): It appears MongoDb destroyed my database, oh well, RIP.
              </Typography>
              <Typography variant="monoStat" className="text-start">
                This was a silly project during the Gamestop meme stock era. It originally involved a Python web scraper
                that scraped the wallstreetbets subreddit and tracked every stock ticker that was mentioned. It then
                displayed those mentions in a number of different ways in an attempt to capture stocks that were gaining
                traction, theoretically, before they became memes. The APIs no longer work, so I "froze" the website for
                January 2023 data. It's pretty fun, have a look (not super mobile friendly).
              </Typography>
              <Typography variant="monoStat" className="text-primary my-4 clear-both">
                React | GraphQL | NextJS | Python | Recharts | MongoDB
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
