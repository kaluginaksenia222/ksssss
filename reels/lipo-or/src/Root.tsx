import {Composition} from 'remotion';
import {LipoReel, LIPO_SECONDS} from './v3/LipoReel';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="LipoOR" component={LipoReel} durationInFrames={Math.round(LIPO_SECONDS * 30)} fps={30} width={1080} height={1920} />
    </>
  );
};
