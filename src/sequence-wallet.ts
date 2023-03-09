import type { ConnectOptions } from "@0xsequence/provider";
import { Chain, getWalletConnectConnector, Wallet } from "@rainbow-me/rainbowkit";

import { SequenceConnector } from "./sequence-connector";

export interface MyWalletOptions {
	chains: Chain[];
	connect?: ConnectOptions;
}
function isRainbow(ethereum: NonNullable<typeof window["ethereum"]>) {
	// `isRainbow` needs to be added to the wagmi `Ethereum` object
	const isRainbow = Boolean(ethereum.isRainbow);

	if (!isRainbow) {
		return false;
	}

	return true;
}

export const sequenceWallet = ({ chains, connect }: MyWalletOptions): Wallet => {
	const isRainbowInjected =
		typeof window !== "undefined" &&
		typeof window.ethereum !== "undefined" &&
		isRainbow(window.ethereum);

	const shouldUseWalletConnect = !isRainbowInjected;

	return {
		id: "sequence",
		name: "Sequence",
		iconUrl:
			"https://user-images.githubusercontent.com/26363061/210380889-f338d084-c42a-477a-ad1e-dd776658ba3f.svg",
		iconBackground: "#fff",
		downloadUrls: {
			browserExtension: "https://sequence.app",
		},
		createConnector: () => {
			const connector = shouldUseWalletConnect
				? getWalletConnectConnector({ chains })
				: new SequenceConnector({
						chains,
						options: {
							connect,
						},
				  });

			return {
				connector,
				mobile: {
					getUri: async () => {
						try {
							await connector.connect();
							return window.location.href;
						} catch (e) {
							console.error("Failed to connect");
						}
						return "";
					},
				},
				desktop: {
					getUri: async () => {
						try {
							await connector.connect();
						} catch (e) {
							console.error("Failed to connect");
						}
						return "";
					},
				},
			};
		},
	};
};
