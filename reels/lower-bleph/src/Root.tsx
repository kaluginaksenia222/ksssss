import {Composition, Still} from 'remotion';
import {Cover} from './v3/Cover';
import {LowerBleph} from './v3/LowerBleph';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="LowerBleph" component={LowerBleph} durationInFrames={1266} fps={30} width={1080} height={1920} />
      <Still id="LowerBlephCover" component={Cover} width={1080} height={1920} />
    </>
  );
};
