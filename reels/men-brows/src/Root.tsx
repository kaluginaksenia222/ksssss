import {Composition} from 'remotion';
import {BrowsReel, BROWS_SECONDS} from './v3/BrowsReel';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="MenBrows" component={BrowsReel} durationInFrames={Math.round(BROWS_SECONDS * 30)} fps={30} width={1080} height={1920} />
    </>
  );
};
