import { ISpeakEventService } from './ISpeakEventService';
import { injectable } from 'inversify';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

@injectable()
export class SpeakEventServiceImpl implements ISpeakEventService {
  speak(text: string): void {
    const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
    const logger = loggerFactory.getLogger({
      processType: 'renderer',
      loggerName: 'SpeakEventServiceImpl',
    });

    if (logger.isDebugEnabled()) logger.debug(`SpeakEventSubscriberImpl subscribe: ${text}`);
    const utterance = new SpeechSynthesisUtterance(text);
    // 速度(0.1 - 10, default=1)
    utterance.rate = 1;
    // 高さ(0 - 2, default=1)
    utterance.pitch = 2;
    // 音量(0 - 1, default=1)
    utterance.volume = 1;
    // ボイス(https://codepen.io/kenzauros/pen/agvEWe)
    /*
    Microsoft Ayumi - Japanese (Japan)	ja-JP
    Microsoft Mark - English (United States)	en-US
    Microsoft Zira - English (United States)	en-US
    Microsoft David - English (United States)	en-US
    Microsoft Haruka - Japanese (Japan)	ja-JP
    Microsoft Ichiro - Japanese (Japan)	ja-JP
    Microsoft Sayaka - Japanese (Japan)	ja-JP
    Google Deutsch	de-DE
    Google US English	en-US
    Google UK English Female	en-GB
    Google UK English Male	en-GB
    Google español	es-ES
    Google español de Estados Unidos	es-US
    Google français	fr-FR
    Google हिन्दी	hi-IN
    Google Bahasa Indonesia	id-ID
    Google italiano	it-IT
    Google 日本語	ja-JP
    Google 한국의	ko-KR
    Google Nederlands	nl-NL
    Google polski	pl-PL
    Google português do Brasil	pt-BR
    Google русский	ru-RU
    Google 普通话（中国大陆）	zh-CN
    Google 粤語（香港）	zh-HK
    Google 國語（臺灣）	zh-TW
    */
    const voices = speechSynthesis.getVoices();
    const voice = voices.filter((v) => v.name == 'Microsoft Haruka - Japanese (Japan)');
    utterance.voice = voice[0];
    // utterance.lang = 'ja-JP';
    // utterance.voice = speechSynthesis.getVoices().filter((voice) => voice.lang === 'ja-JP')[0];
    speechSynthesis.speak(utterance);
  }
}
