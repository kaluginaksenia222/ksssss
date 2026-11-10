import {Composition} from 'remotion';
import {Abdomino, ABDOMINO_SECONDS} from './v3/Abdomino';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AbdominoBA" component={Abdomino} durationInFrames={Math.round(ABDOMINO_SECONDS * 30)} fps={30} width={1080} height={1920} />
    </>
  );
};
