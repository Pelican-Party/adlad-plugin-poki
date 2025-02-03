type RewardedBreakOptions = {
	size?: "small" | "medium" | "large";
	onStart?: () => void;
};

declare class PokiSDK {
	static init(): Promise<void>;
	static gameLoadingFinished(): void;
	static gameplayStart(): void;
	static gameplayStop(): void;
	static commercialBreak(breakStartCallback?: () => void): Promise<void>;
	static rewardedBreak(options: RewardedBreakOptions): Promise<boolean>;
	static displayAd(el: HTMLElement, size: string): void;
	static destroyAd(el: HTMLElement): void;
	static shareableURL(params: Record<string, string>): Promise<string>;
	static getURLParam(param: string): Promise<string>;
	static playtestSetCanvas(canvas: HTMLCanvasElement): void;
}
