import { Outlet, useLocation, useNavigate } from 'react-router';

import { SectionDivider, TabGroup } from '@/components/ui';

export const DiscGolfLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="w-full flex flex-col gap-4 pt-4">
      <SectionDivider label="Disc Golf" labelPosition="middle" />
      <TabGroup
        variant="simple"
        value={pathname}
        className="mx-auto"
        onChange={(value) => navigate(value)}
        items={[
          { label: 'Bags', value: '/playground/disc-golf/bags' },
          { label: 'Throws', value: '/playground/disc-golf/throws' },
          { label: 'Sessions', value: '/playground/disc-golf/sessions' },
          { label: 'Rounds', value: '/playground/disc-golf/rounds' },
        ]}
      />
      <Outlet />
    </div>
  );
};
