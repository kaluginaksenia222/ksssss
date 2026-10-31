import {Composition} from 'remotion';
import {BeforeAfter} from './v3/BeforeAfter';
import {BeforeAfterV2} from './v3/BeforeAfterV2';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="BreastLiftBA" component={BeforeAfter} durationInFrames={510} fps={30} width={1080} height={1920} />
      <Composition id="BreastLiftBAv2" component={BeforeAfterV2} durationInFrames={522} fps={30} width={1080} height={1920} />
    </>
  );
};
