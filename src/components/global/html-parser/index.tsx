'use client';

import parse from 'html-react-parser';
import { useEffect, useState } from 'react';
type Props = {
  html: string;
};

const HtmlParser = ({ html }: Props) => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(true);
  }, []);

  return (
    <div className='[&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_h4]:text-xl [&_h5]:text-lg [&_h6]:text-base [&_blockquote]:italic [&_iframe]:aspect-video text-themeGray flex flex-col gap-y-3'>
      {mounted && parse(html)}
    </div>
  );
};

export default HtmlParser;
