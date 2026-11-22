import {Composition} from 'remotion';
import {BA_SECONDS, BeforeAfter} from './v3/BeforeAfter';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AbdoBreastBA" component={BeforeAfter} durationInFrames={Math.round(BA_SECONDS * 30)} fps={30} width={1080} height={1920} />
    </>
  );
};
