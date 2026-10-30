import {Composition} from 'remotion';
import {Expert} from './Expert';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition id="ExpertRadiesse" component={Expert} durationInFrames={1792} fps={30} width={1080} height={1920} />
  );
};
