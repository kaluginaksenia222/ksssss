import React from "react";
import { Composition } from "remotion";
import { SHORT01_FRAMES, Short01 } from "./Short01";
import { Banner } from "./Banner";
import { BannerKids } from "./BannerKids";

export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="KidsBanner" component={BannerKids} durationInFrames={1} fps={30} width={2048} height={1152} />
  <Composition id="LunnyBanner" component={Banner} durationInFrames={1} fps={30} width={2048} height={1152} />
  <Composition id="LunnyShort01" component={Short01} durationInFrames={SHORT01_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
