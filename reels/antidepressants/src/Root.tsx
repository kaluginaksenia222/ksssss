import {Composition} from 'remotion';
import {Meds, MEDS_SECONDS} from './v3/Meds';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Antidepressants" component={Meds} durationInFrames={Math.round(MEDS_SECONDS * 30)} fps={30} width={1080} height={1920} />
    </>
  );
};
