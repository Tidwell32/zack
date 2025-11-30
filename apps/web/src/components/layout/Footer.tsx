import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/icons';
import { COLORS } from '@/utils';

import { Typography } from '../ui/Typography';

export const Footer = () => {
  return (
    <div className="mt-4 gap-4 flex flex-col">
      <div className="flex gap-4">
        <MailIcon color={COLORS.secondary} />
        <Typography as="a" href="mailto:tidw2094@gmail.com" className="text-primary">
          Contact me
        </Typography>
      </div>
      <div className="flex gap-4">
        <LinkedInIcon color={COLORS.secondary} />
        <Typography
          as="a"
          href="https://www.linkedin.com/in/zack-tidwell-760a7bb1/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary"
        >
          Connect with me
        </Typography>
      </div>
      <div className="flex gap-4">
        <GitHubIcon color={COLORS.secondary} />
        <Typography
          as="a"
          href="https://github.com/Tidwell32?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary"
        >
          Repo for this website
        </Typography>
      </div>
    </div>
  );
};
