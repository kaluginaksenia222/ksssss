import {Composition} from 'remotion';
import {Natural} from './v3/Natural';

export const RemotionRoot: React.FC = () => {
  return <Composition id="NaturalReel" component={Natural} durationInFrames={606} fps={30} width={1080} height={1920} />;
};
