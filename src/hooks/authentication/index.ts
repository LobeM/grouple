import { onSignUpUser } from '@/actions/auth';
import { SignInSchema } from '@/components/forms/sign-in/schema';
import { SignUpSchema } from '@/components/forms/sign-up/schema';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export const useAuthSignIn = () => {
  const { isLoaded, setActive, signIn } = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    mode: 'onBlur',
  });

  const router = useRouter();

  const onClerkAuth = async (email: string, password: string) => {
    if (!isLoaded)
      return toast('Error', { description: 'Oops! something went wrong' });

    try {
      const authenticated = await signIn.create({
        identifier: email,
        password,
      });

      if (authenticated.status === 'complete') {
        reset();
        await setActive({ session: authenticated.createdSessionId });
        toast('Success', { description: 'Welcome back!' });
        router.push('/callback/sign-in');
      }
    } catch (error: any) {
      if (error.errors[0].code === 'form_password_incorrect') {
        toast('Error', {
          description: 'email or password is incorrect try again',
        });
      }
    }
  };

  const { mutate: InitiateLoginFlow, isPending } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      onClerkAuth(email, password),
  });

  const onAuthenticateUser = handleSubmit(async (values) => {
    InitiateLoginFlow({ email: values.email, password: values.password });
  });

  return {
    onAuthenticateUser,
    isPending,
    errors,
    register,
  };
};

export const useAuthSignUp = () => {
  const { isLoaded, setActive, signUp } = useSignUp();
  const [creating, setCreating] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    mode: 'onBlur',
  });

  const router = useRouter();

  const onGenerateCode = async (email: string, password: string) => {
    if (!isLoaded)
      return toast('Error', { description: 'Oops! something went wrong' });

    try {
      if (email && password) {
        await signUp.create({
          emailAddress: getValues('email'),
          password: getValues('password'),
        });

        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });

        setVerifying(true);
      } else {
        return toast('Error', { description: 'Please fill all the fields' });
      }
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
    }
  };

  const onInitiateUserRegistration = handleSubmit(async (values) => {
    if (!isLoaded)
      return toast('Error', { description: 'Oops! something went wrong' });

    try {
      setCreating(true);
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== 'complete') {
        return toast('Error', {
          description: 'Oops! something went wrong, status is not complete',
        });
      }

      if (completeSignUp.status === 'complete') {
        if (!signUp.createdUserId) return;
        const user = await onSignUpUser({
          firstname: values.firstname,
          lastname: values.lastname,
          clerkId: signUp.createdUserId,
          image: '',
        });

        reset();

        if (user.status === 200) {
          toast('Success', { description: user.message });
          await setActive({ session: completeSignUp.createdSessionId });
          router.push('/group/create');
        }
        if (user.status !== 200) {
          toast('Error', { description: user.message + 'action failed' });
          router.refresh();
        }
        setCreating(false);
        setVerifying(false);
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
    }
  });

  return {
    register,
    errors,
    onGenerateCode,
    onInitiateUserRegistration,
    verifying,
    creating,
    code,
    setCode,
    getValues,
  };
};

export const useGoogleAuth = () => {
  const { isLoaded: LoadedSignIn, signIn } = useSignIn();
  const { isLoaded: LoadedSignUp, signUp } = useSignUp();

  const signInWith = (strategy: OAuthStrategy) => {
    if (!LoadedSignIn) return;
    try {
      return signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/callback',
        redirectUrlComplete: '/callback/sign-in',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const signUpWith = (strategy: OAuthStrategy) => {
    if (!LoadedSignUp) return;
    try {
      return signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/callback',
        redirectUrlComplete: '/callback/sign-up',
      });
    } catch (error) {
      console.error(error);
    }
  };

  return { signInWith, signUpWith };
};
