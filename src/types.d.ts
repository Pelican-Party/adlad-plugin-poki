declare class PokiSDK {
	static init(options?: PokiInitOptions): Promise<void>;
	static gameLoadingFinished(): void;
	static gameplayStart(): void;
	static gameplayStop(): void;
	static commercialBreak(): Promise<void>;
	static rewardedBreak(): Promise<boolean>;
}

interface PokiInitOptions {
	debug?: boolean;
}
