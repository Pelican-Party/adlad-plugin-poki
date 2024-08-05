export function pokiPlugin() {
	let initializeCalled = false;
	let loadFinishCalled = false;

	const props = /** @type {const} */ ({
		init: "init",
		gameLoadingFinished: "gameLoadingFinished",
		gameplayStart: "gameplayStart",
		gameplayStop: "gameplayStop",
		commercialBreak: "commercialBreak",
		rewardedBreak: "rewardedBreak",
		displayAd: "displayAd",
		destroyAd: "destroyAd",
		shareableURL: "shareableURL",
		getURLParam: "getURLParam",
	});

	// @ts-ignore We want to make sure that `props` remains an object.
	// Normally, terser would turn every property into a separate variable.
	// This would be fine for the first pass of minification, but if a user
	// were to bundle and minify this libarry with their own code, they will minify a second time
	// causing all these props to lose their quotes.
	// This can be an issue if the new bundle has property mangling enabled.
	// This if statement will never run, but rollup and terser will both think it
	// might and so the `props` opbject will remain an object.
	if (props > 0) console.log(props);

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
			await ctx.loadScriptTag("https://game-cdn.poki.com/scripts/v2/poki-sdk.js");
			await PokiSDK[props.init]();
		},
		manualNeedsMute: true,
		async loadStop() {
			if (loadFinishCalled) return;
			loadFinishCalled = true;
			PokiSDK[props.gameLoadingFinished]();
		},
		async gameplayStart() {
			PokiSDK[props.gameplayStart]();
		},
		async gameplayStop() {
			PokiSDK[props.gameplayStop]();
		},
		async showFullScreenAd() {
			let didShowAd = false;
			/** @type {import("$adlad").AdErrorReason?} */
			let errorReason = null;
			try {
				await PokiSDK[props.commercialBreak](() => {
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
				didShowAd = await PokiSDK[props.rewardedBreak](() => {
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
			PokiSDK[props.displayAd](options.el, size);
		},
		destroyBannerAd(options) {
			PokiSDK[props.destroyAd](options.el);
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
				return await PokiSDK[props.shareableURL](paramsObj);
			},
			/**
			 * @param {string} param
			 */
			getUrlParam(param) {
				return PokiSDK[props.getURLParam](param);
			},
		},
	});

	return plugin;
}
