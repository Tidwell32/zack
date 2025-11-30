import { useEffect, useState } from 'react';

import { COLORS } from '@/utils';

import { RotatePhoneIcon } from '../icons';

import { Typography } from './Typography';

export const RotateYourPhone = ({ autoDismiss = true }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [autoDismiss]);

  if (!show) return null;

  return (
    <div className="flex flex-col gap-8 items-center justify-center fixed inset-0 z-50 backdrop-blur-sm">
      <style>
        {`
          @keyframes rotate-and-scale {
            0% {
              transform: rotate(0deg) scale(1);
            }
            50% {
              transform: rotate(45deg) scale(1.25);
            }
            100% {
              transform: rotate(90deg) scale(1);
            }
          }
          .rotate-phone-animation {
            animation: rotate-and-scale 2s ease-in-out forwards;
          }
        `}
      </style>
      <div className="rotate-phone-animation">
        <RotatePhoneIcon size={148} color={COLORS.secondary} />
      </div>
      <Typography variant="h1">Rotate phone for best experience</Typography>
    </div>
  );
};
