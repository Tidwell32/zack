import { useLoaderData } from 'react-router';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const useTypedLoaderData = <T>() => {
  return useLoaderData() as T;
};
