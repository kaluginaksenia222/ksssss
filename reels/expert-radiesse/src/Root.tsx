import {Composition} from 'remotion';
import {Expert} from './Expert';
import {ExpertV2} from './v2/ExpertV2';
import {ExpertV3} from './v3/ExpertV3';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="ExpertRadiesse" component={Expert} durationInFrames={1792} fps={30} width={1080} height={1920} />
      <Composition id="ExpertRadiesseV2" component={ExpertV2} durationInFrames={1792} fps={30} width={1080} height={1920} />
      <Composition id="ExpertRadiesseV3" component={ExpertV3} durationInFrames={1792} fps={30} width={1080} height={1920} />
    </>
  );
};
