import * as React from 'react';

import { cn } from '@/utils';

// Modelled after Material UIs Grid where you just wrap some <Grid.Children xs={3} md={6} /> with a <Grid.Parent />

type Span = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type Breakpoint = 'lg' | 'md' | 'sm' | 'xl' | 'xs';

interface ParentProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  gap?: 'lg' | 'md' | 'none' | 'sm' | 'xl' | 'xs';
}

interface ChildProps extends React.HTMLAttributes<HTMLDivElement> {
  xs?: Span;
  sm?: Span;
  md?: Span;
  lg?: Span;
  xl?: Span;
}

const spanClasses: Record<Breakpoint, Record<Span, string>> = {
  xs: {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
  },
  sm: {
    1: 'sm:col-span-1',
    2: 'sm:col-span-2',
    3: 'sm:col-span-3',
    4: 'sm:col-span-4',
    5: 'sm:col-span-5',
    6: 'sm:col-span-6',
    7: 'sm:col-span-7',
    8: 'sm:col-span-8',
    9: 'sm:col-span-9',
    10: 'sm:col-span-10',
    11: 'sm:col-span-11',
    12: 'sm:col-span-12',
  },
  md: {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
    4: 'md:col-span-4',
    5: 'md:col-span-5',
    6: 'md:col-span-6',
    7: 'md:col-span-7',
    8: 'md:col-span-8',
    9: 'md:col-span-9',
    10: 'md:col-span-10',
    11: 'md:col-span-11',
    12: 'md:col-span-12',
  },
  lg: {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
    5: 'lg:col-span-5',
    6: 'lg:col-span-6',
    7: 'lg:col-span-7',
    8: 'lg:col-span-8',
    9: 'lg:col-span-9',
    10: 'lg:col-span-10',
    11: 'lg:col-span-11',
    12: 'lg:col-span-12',
  },
  xl: {
    1: 'xl:col-span-1',
    2: 'xl:col-span-2',
    3: 'xl:col-span-3',
    4: 'xl:col-span-4',
    5: 'xl:col-span-5',
    6: 'xl:col-span-6',
    7: 'xl:col-span-7',
    8: 'xl:col-span-8',
    9: 'xl:col-span-9',
    10: 'xl:col-span-10',
    11: 'xl:col-span-11',
    12: 'xl:col-span-12',
  },
};

const gapClass: Record<NonNullable<ParentProps['gap']>, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const colsClass: Record<NonNullable<ParentProps['cols']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  8: 'grid-cols-8',
  12: 'grid-cols-12',
};

const GridParent: React.FC<ParentProps> = ({ cols = 12, gap = 'md', className, children, ...rest }) => {
  return (
    <div className={cn('grid', colsClass[cols], gapClass[gap], className)} {...rest}>
      {children}
    </div>
  );
};

const GridChild: React.FC<ChildProps> = ({ xs = 12, sm, md, lg, xl, className, children, ...rest }) => {
  const classes: string[] = [];

  const addSpan = (bp: Breakpoint, span?: Span) => {
    if (!span) return;
    classes.push(spanClasses[bp][span]);
  };

  addSpan('xs', xs);
  addSpan('sm', sm);
  addSpan('md', md);
  addSpan('lg', lg);
  addSpan('xl', xl);

  return (
    <div className={cn(classes.join(' '), className)} {...rest}>
      {children}
    </div>
  );
};

export const Grid = {
  Parent: GridParent,
  Child: GridChild,
};
