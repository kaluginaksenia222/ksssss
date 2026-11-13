import {Composition} from 'remotion';
import {Reel} from './Reel';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DischargeDay3"
      component={Reel}
      durationInFrames={1042}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
