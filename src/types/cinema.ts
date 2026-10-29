export type CostumeOption = 'royal-blue' | 'cream-pink' | 'deep-maroon';

export interface ChoreographyShot {
  id: number;
  shotNumber: number;
  title: string;
  stageName: string;
  startTime: number;
  duration: number;
  cameraMovement: string;
  cameraType: 'medium-shot' | 'tracking-full' | 'orbit-360' | 'facial-closeup' | 'cinematic-push';
  danceStep: string;
  mudraName: string;
  mudraMeaning: string;
  facialExpression: string;
  sareeFabricPhysics: string;
  audioBeatSync: string;
  beatIntensity: 'soft' | 'moderate' | 'high' | 'peak';
  imageSrc: string;
  costume: CostumeOption;
  videoPrompts: {
    veo2: string;
    sora: string;
    kling: string;
    runway: string;
    negativePrompt: string;
    cameraMotionConfig: string;
  };
}

export interface CostumeStyle {
  id: CostumeOption;
  name: string;
  badge: string;
  description: string;
  paletteDescription: string;
  accentHex: string;
  previewImage: string;
}

export interface AudioPreset {
  id: string;
  title: string;
  subTitle: string;
  bpm: number;
  genre: string;
  totalDuration: number;
  pattern: 'dholak-fast' | 'romantic-medium' | 'garba-energetic' | 'thumka-classic';
  description: string;
}

export interface VisualFXSettings {
  goldenFairyLights: boolean;
  marigoldPetals: boolean;
  rosePetals: boolean;
  goldZardoziGleam: boolean;
  cinematicLensFlares: boolean;
  beatCameraShake: boolean;
  cinematicGrain: boolean;
  aspectRatioLetterbox: boolean;
}

export interface VideoPromptSuite {
  mainPrompt: string;
  negativePrompt: string;
  cameraMotionConfig: string;
  fabricDynamicsNotes: string;
  characterConsistencyAnchors: string[];
  recommendedSettings: {
    aspectRatio: string;
    fps: number;
    resolution: string;
    motionBucket: number;
  };
}
