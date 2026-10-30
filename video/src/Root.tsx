import {Composition} from 'remotion';
import {Reel} from './Reel';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Blepharoplasty"
      component={Reel}
      durationInFrames={1511}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
