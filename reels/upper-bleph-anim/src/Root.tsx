import {Composition} from 'remotion';
import {UpperBleph, UPPER_BLEPH_SECONDS} from './v3/UpperBleph';

export const RemotionRoot: React.FC = () => {
  return <Composition id="UpperBleph" component={UpperBleph} durationInFrames={UPPER_BLEPH_SECONDS * 30} fps={30} width={1080} height={1920} />;
};
