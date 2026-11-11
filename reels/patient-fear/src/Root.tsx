import {Composition, Still} from 'remotion';
import {Cover} from './v3/Cover';
import {Fear, FEAR_SECONDS} from './v3/Fear';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="PatientFear" component={Fear} durationInFrames={Math.round(FEAR_SECONDS * 30)} fps={30} width={1080} height={1920} />
      <Still id="PatientFearCover" component={Cover} width={1080} height={1920} />
    </>
  );
};
