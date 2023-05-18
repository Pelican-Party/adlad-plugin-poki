declare class PokiSDK {
	static init(): Promise<void>;
	static gameLoadingFinished(): void;
	static gameplayStart(): void;
	static gameplayStop(): void;
	static commercialBreak(breakStartCallback?: () => void): Promise<void>;
	static rewardedBreak(breakStartCallback?: () => void): Promise<boolean>;
	static displayAd(el: HTMLElement, size: string): void;
}
