export function pokiPlugin() {
	let initializeCalled = false;
	let loadFinishCalled = false;

	/** @type {import("$adlad").AdLadPluginInitializeContext} */
	let context;

	const plugin = /** @type {const} @satisfies {import("$adlad").AdLadPlugin} */ ({
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
		showBannerAd(options) {
			const availableSizes = [
				{ w: 728, h: 90 },
				{ w: 300, h: 250 },
				{ w: 970, h: 250 },
				{ w: 160, h: 600 },
				{ w: 320, h: 50 },
			];
			let biggest = null;
			let biggestSize = 0;
			for (const size of availableSizes) {
				if (size.w > options.width) continue;
				if (size.h > options.height) continue;
				const total = size.w * size.h;
				if (total > biggestSize) {
					biggestSize = total;
					biggest = size;
				}
			}
			if (!biggest) return;
			const size = biggest.w + "x" + biggest.h;
			PokiSDK.displayAd(options.el, size);
		},
		customRequests: {
			/**
			 * @param {ConstructorParameters<typeof URLSearchParams>} args
			 */
			async getShareableUrl(...args) {
				const urlParams = new URLSearchParams(...args);
				/** @type {Object.<string, string>} */
				const paramsObj = {};
				for (const [key, value] of urlParams.entries()) {
					paramsObj[key] = value;
				}
				return await PokiSDK.shareableURL(paramsObj);
			},
			/**
			 * @param {string} param
			 */
			getUrlParam(param) {
				return PokiSDK.getURLParam(param);
			},
		},
	});

	return plugin;
}
