import {Composition, Still} from 'remotion';
import {Cover} from './v3/Cover';
import {Day16, DAY16_SECONDS} from './v3/Day16';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AbdominoDay16" component={Day16} durationInFrames={Math.round(DAY16_SECONDS * 30)} fps={30} width={1080} height={1920} />
      <Still id="AbdominoDay16Cover" component={Cover} width={1080} height={1920} />
    </>
  );
};
