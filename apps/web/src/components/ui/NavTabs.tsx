import { Link, matchPath, useLocation } from 'react-router';

import type { ClippedButtonVariant } from '@/components/ui';
import { ClippedButton } from '@/components/ui';
import { cn } from '@/utils';

interface NavTabItem {
  label: string;
  to: string;
}

interface NavTabsProps {
  borderWidth?: number;
  className?: string;
  items: NavTabItem[];
  variant?: ClippedButtonVariant;
}

export const NavTabs = ({ borderWidth = 2, items, className, variant = 'layered' }: NavTabsProps) => {
  const location = useLocation();

  return (
    <div className={cn('flex flex-col md:flex-row flex-wrap gap-3', className)}>
      {items.map((item) => {
        const isActive = matchPath({ path: item.to, end: true }, location.pathname) != null;

        return (
          <Link key={item.to} to={item.to}>
            <ClippedButton
              clipSize="sm"
              borderWidth={borderWidth}
              className="min-w-28 px-4 py-1.5 text-center w-full"
              color={isActive ? 'secondary' : 'primary'}
              variant={variant}
            >
              {item.label}
            </ClippedButton>
          </Link>
        );
      })}
    </div>
  );
};
