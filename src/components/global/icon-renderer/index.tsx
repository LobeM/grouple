import {
  FileDuoToneBlack,
  FileDuoToneWhite,
  Home,
  HomeDuoToneWhite,
  MegaPhoneDuoToneBlack,
  MegaPhoneDuoToneWhite,
} from '@/icons';

type Props = {
  mode: 'LIGHT' | 'DARK';
  icon: string;
};

const IconRenderer = ({ mode, icon }: Props) => {
  switch (icon) {
    case 'general':
      return mode === 'DARK' ? <Home /> : <HomeDuoToneWhite />;
    case 'announcement':
      return mode === 'DARK' ? (
        <MegaPhoneDuoToneBlack />
      ) : (
        <MegaPhoneDuoToneWhite />
      );
    case 'doc':
      return mode === 'DARK' ? <FileDuoToneBlack /> : <FileDuoToneWhite />;
    default:
      return <></>;
  }
};

export default IconRenderer;
