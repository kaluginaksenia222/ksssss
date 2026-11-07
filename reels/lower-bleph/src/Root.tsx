import {Composition} from 'remotion';
import {LowerBleph} from './v3/LowerBleph';

export const RemotionRoot: React.FC = () => {
  return <Composition id="LowerBleph" component={LowerBleph} durationInFrames={1286} fps={30} width={1080} height={1920} />;
};
