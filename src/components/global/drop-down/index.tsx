'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import React, { JSX } from 'react';

type Props = {
  title: string;
  trigger: JSX.Element;
  children: React.ReactNode;
  ref?: React.RefObject<HTMLButtonElement>;
};

const DropDown = ({ title, trigger, children, ref }: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild ref={ref}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className='rounded-2xl w-56 items-start bg-themeBlack border-themeGray bg-clip-padding backdrop--blur__safari backdrop-blur-4xl p-4'>
        <h4 className='text-sm pl-3'>{title}</h4>
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default DropDown;
