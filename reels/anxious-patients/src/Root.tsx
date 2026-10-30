import {Composition} from 'remotion';
import {Anxious} from './v3/Anxious';

export const RemotionRoot: React.FC = () => {
  return <Composition id="AnxiousPatients" component={Anxious} durationInFrames={972} fps={30} width={1080} height={1920} />;
};
