'use client';

import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/hooks/authentication';
import { Google } from '@/icons';
import { Loader } from '../loader';

type Props = {
  method: 'signin' | 'signup';
};

const GoogleAuthButton = ({ method }: Props) => {
  const { signInWith, signUpWith } = useGoogleAuth();
  return (
    <Button
      {...(method === 'signin'
        ? { onClick: () => signInWith('oauth_google') }
        : { onClick: () => signUpWith('oauth_google') })}
      className='w-full rounded-2xl flex gap-3 bg-themeBlack border-themeGray'
      variant='outline'
    >
      <Loader loading={false}>
        <Google />
        Google
      </Loader>
    </Button>
  );
};

export default GoogleAuthButton;
