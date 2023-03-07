export function pokiPlugin() {
	let initializeCalled = false;
	let loadFinishCalled = false;

	/** @type {import("$adlad").AdLadPlugin} */
	const plugin = {
		name: "poki",
		async initialize() {
			if (initializeCalled) {
				throw new Error("Poki plugin is being initialized more than once");
			}
			initializeCalled = true;

			const sdkUrl = "https://game-cdn.poki.com/scripts/v2/poki-sdk.js";
			await import(sdkUrl);
			window.location
			await PokiSDK.init({debug: true});
		},
		async loadStop() {
			if (loadFinishCalled) return;
			loadFinishCalled = true;
			PokiSDK.gameLoadingFinished();
		},
		async gameplayStart() {
			PokiSDK.gameplayStart();
		},
		async gameplayStop() {
			PokiSDK.gameplayStop();
		},
		async showFullScreenAd() {
			await PokiSDK.commercialBreak();
			return {
				didShowAd: null,
				errorReason: null,
			}
		},
		async showRewardedAd() {
			const didShowAd = await PokiSDK.rewardedBreak();
			/** @type {import("$adlad").AdErrorReason?} */
			let errorReason = null;
			if (!didShowAd) {
				errorReason = "unknown";
				// TODO: Use "adblocker" when an adblocker is detected
			}
			return {
				didShowAd,
				errorReason,
			}
		},
	};

	return plugin;
}
