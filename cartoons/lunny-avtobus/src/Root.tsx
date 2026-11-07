import React from "react";
import { Composition } from "remotion";
import { SHORT01_FRAMES, Short01 } from "./Short01";

export const RemotionRoot: React.FC = () => (
  <Composition id="LunnyShort01" component={Short01} durationInFrames={SHORT01_FRAMES} fps={30} width={1080} height={1920} />
);
