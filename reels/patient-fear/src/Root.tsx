import {Composition} from 'remotion';
import {Fear, FEAR_SECONDS} from './v3/Fear';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="PatientFear" component={Fear} durationInFrames={Math.round(FEAR_SECONDS * 30)} fps={30} width={1080} height={1920} />
    </>
  );
};
