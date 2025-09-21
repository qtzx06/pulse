/**
 * @fileoverview Control real time music with a MIDI controller
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { parsePromptWithGemini } from './controlAgent';
import type { PlaybackState, Prompt } from './music_types';
import { GoogleGenAI, LiveMusicFilteredPrompt } from '@google/genai';
import { PromptDjMidi } from './music_components/PromptDjMidi';
import { ToastMessage } from './music_components/ToastMessage';
import { LiveMusicHelper } from './music_utils/LiveMusicHelper';
import { AudioAnalyser } from './music_utils/AudioAnalyser';

const musicAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: 'v1alpha' });
const textAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'lyria-realtime-exp';

export function main() {
  let prompts = buildInitialPrompts();

  const pdjMidi = new PromptDjMidi(prompts);
  document.body.appendChild(pdjMidi);

  const toastMessage = new ToastMessage();
  document.body.appendChild(toastMessage);

  const liveMusicHelper = new LiveMusicHelper(musicAI, model);
  liveMusicHelper.setWeightedPrompts(prompts);

  const audioAnalyser = new AudioAnalyser(liveMusicHelper.audioContext);
  liveMusicHelper.extraDestination = audioAnalyser.node;

  pdjMidi.addEventListener('prompts-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<Map<string, Prompt>>;
    prompts = customEvent.detail;
    liveMusicHelper.setWeightedPrompts(prompts);
  }));

  liveMusicHelper.addEventListener('playback-state-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<PlaybackState>;
    const playbackState = customEvent.detail;
    pdjMidi.playbackState = playbackState;
    playbackState === 'playing' ? audioAnalyser.start() : audioAnalyser.stop();
  }));

  liveMusicHelper.addEventListener('filtered-prompt', ((e: Event) => {
    const customEvent = e as CustomEvent<LiveMusicFilteredPrompt>;
    const filteredPrompt = customEvent.detail;
    toastMessage.show(filteredPrompt.filteredReason!)
    pdjMidi.addFilteredPrompt(filteredPrompt.text!);
  }));

  const errorToast = ((e: Event) => {
    const customEvent = e as CustomEvent<string>;
    const error = customEvent.detail;
    toastMessage.show(error);
  });

  liveMusicHelper.addEventListener('error', errorToast);
  pdjMidi.addEventListener('error', errorToast);

  audioAnalyser.addEventListener('audio-level-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<number>;
    const level = customEvent.detail;
    pdjMidi.audioLevel = level;
  }));

  const updateFirstPrompt = async (text: string) => {
    if (text) {
      const promptTexts = DEFAULT_PROMPTS.map(p => p.text);
      const controlParams = await parsePromptWithGemini(textAI, text, promptTexts);
      console.log("Received Control Params:", controlParams);

      if (controlParams && controlParams.prompts && Array.isArray(controlParams.prompts)) {
        // Turn off all prompts first to create a clean slate
        prompts.forEach(p => p.weight = 0);

        // Set weights for the prompts returned by the agent
        controlParams.prompts.forEach((agentPrompt: { prompt_name: string, weight: number }) => {
          const targetPrompt = [...prompts.values()].find(p => p.text === agentPrompt.prompt_name);
          if (targetPrompt) {
            targetPrompt.weight = agentPrompt.weight;
            prompts.set(targetPrompt.promptId, targetPrompt);
          }
        });

        // Update the UI and the music model with the new mix
        const newPrompts = new Map(prompts);
        pdjMidi.updatePrompts(newPrompts);
        liveMusicHelper.setWeightedPrompts(newPrompts);
        
        const config: any = {};
        if (controlParams.bpm) config.bpm = controlParams.bpm;
        if (controlParams.density) config.density = controlParams.density;
        if (controlParams.brightness) config.brightness = controlParams.brightness;

        if (Object.keys(config).length > 0) {
          console.log("Updating Music Config:", config);
          liveMusicHelper.updateMusicConfig(config, !!config.bpm);
        }
      }
    }
  };

  return { liveMusicHelper, updateFirstPrompt };
}

function buildInitialPrompts() {
  // Start with a predefined, pleasant mix instead of a blank slate.
  const startOn = [
    { text: 'Lush Strings', weight: 0.8 },
    { text: 'Sparkling Arpeggios', weight: 0.4 },
    { text: 'Chillwave', weight: 0.6 },
  ];

  const prompts = new Map<string, Prompt>();

  for (let i = 0; i < DEFAULT_PROMPTS.length; i++) {
    const promptId = `prompt-${i}`;
    const prompt = DEFAULT_PROMPTS[i];
    const { text, color } = prompt;

    const startPrompt = startOn.find(p => p.text === text);

    prompts.set(promptId, {
      promptId,
      text,
      weight: startPrompt ? startPrompt.weight : 0,
      cc: i,
      color,
    });
  }

  return prompts;
}

const DEFAULT_PROMPTS = [
  { color: '#9900ff', text: 'Bossa Nova' },
  { color: '#5200ff', text: 'Chillwave' },
  { color: '#ff25f6', text: 'Drum and Bass' },
  { color: '#2af6de', text: 'Post Punk' },
  { color: '#ffdd28', text: 'Shoegaze' },
  { color: '#2af6de', text: 'Funk' },
  { color: '#9900ff', text: 'Chiptune' },
  { color: '#3dffab', text: 'Lush Strings' },
  { color: '#d8ff3e', text: 'Sparkling Arpeggios' },
  { color: '#d9b2ff', text: 'Staccato Rhythms' },
  { color: '#3dffab', text: 'Punchy Kick' },
  { color: '#ffdd28', text: 'Dubstep' },
  { color: '#ff25f6', text: 'K Pop' },
  { color: '#d8ff3e', text: 'Neo Soul' },
  { color: '#5200ff', text: 'Trip Hop' },
  { color: '#d9b2ff', text: 'Thrash' },
];


