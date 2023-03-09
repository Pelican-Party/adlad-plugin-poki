export function pokiPlugin() {
	let initializeCalled = false;
	let loadFinishCalled = false;

	/** @type {import("$adlad").AdLadPluginInitializeContext} */
	let context;

	/** @type {import("$adlad").AdLadPlugin} */
	const plugin = {
		name: "poki",
		async initialize(ctx) {
			if (initializeCalled) {
				throw new Error("Poki plugin is being initialized more than once");
			}
			initializeCalled = true;

			context = ctx;
			const sdkUrl = "https://game-cdn.poki.com/scripts/v2/poki-sdk.js";
			await import(sdkUrl);
			await PokiSDK.init();
		},
		manualNeedsMute: true,
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
			let didShowAd = false;
			/** @type {import("$adlad").AdErrorReason?} */
			let errorReason = null;
			try {
				await PokiSDK.commercialBreak(() => {
					didShowAd = true;
					context.setNeedsMute(true);
				});
			} catch (e) {
				console.warn("PokiSDK commercialBreak call was rejected", e);
				didShowAd = false;
				errorReason = "unknown";
			} finally {
				context.setNeedsMute(false);
			}
			// TODO: Use adblocker when an adblocker is detected
			if (!didShowAd && !errorReason) {
				errorReason = "no-ad-available";
			}
			return {
				didShowAd,
				errorReason,
			};
		},
		async showRewardedAd() {
			let didShowAd = false;
			/** @type {import("$adlad").AdErrorReason?} */
			let errorReason = null;
			try {
				didShowAd = await PokiSDK.rewardedBreak(() => {
					context.setNeedsMute(true);
				});
			} catch (e) {
				console.warn("PokiSDK rewardedBreak call was rejected", e);
				didShowAd = false;
				errorReason = "unknown";
			} finally {
				context.setNeedsMute(false);
			}
			return {
				didShowAd,
				// TODO: Use "adblocker" when an adblocker is detected
				errorReason,
			};
		},
	};

	return plugin;
}
