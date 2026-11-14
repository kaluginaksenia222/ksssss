import {Composition} from 'remotion';
import {DavinciReel, DAVINCI_SECONDS} from './v3/DavinciReel';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="DavinciOR" component={DavinciReel} durationInFrames={Math.round(DAVINCI_SECONDS * 30)} fps={30} width={1080} height={1920} />
    </>
  );
};
