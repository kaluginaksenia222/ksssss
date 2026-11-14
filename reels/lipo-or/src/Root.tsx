import {Composition} from 'remotion';
import {LipoReel, LIPO_SECONDS} from './v3/LipoReel';
import {LipoReel2, LIPO2_SECONDS} from './v3/LipoReel2';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="LipoOR" component={LipoReel} durationInFrames={Math.round(LIPO_SECONDS * 30)} fps={30} width={1080} height={1920} />
      <Composition id="LipoOR2" component={LipoReel2} durationInFrames={Math.round(LIPO2_SECONDS * 30)} fps={30} width={1080} height={1920} />
    </>
  );
};
