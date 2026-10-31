import {Composition} from 'remotion';
import {Implant} from './v3/Implant';

export const RemotionRoot: React.FC = () => {
  return <Composition id="ImplantSize" component={Implant} durationInFrames={738} fps={30} width={1080} height={1920} />;
};
