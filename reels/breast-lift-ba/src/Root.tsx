import {Composition} from 'remotion';
import {BeforeAfter} from './v3/BeforeAfter';

export const RemotionRoot: React.FC = () => {
  return <Composition id="BreastLiftBA" component={BeforeAfter} durationInFrames={510} fps={30} width={1080} height={1920} />;
};
