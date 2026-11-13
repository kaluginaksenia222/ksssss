import {Composition} from 'remotion';
import {Reel} from './Reel';
import {Story, STORY_SECONDS} from './Story';

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="DischargeDay3"
      component={Reel}
      durationInFrames={2199}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition id="DischargeStory" component={Story} durationInFrames={Math.round(STORY_SECONDS * 30)} fps={30} width={1080} height={1920} />
    </>
  );
};
