import { effect, mutable, provide, ref } from "@pumped-fn/core";
import { client } from "./client";

const identities = mutable([client], async ([client]) => {
	const users = await client("get.users");
	return users;
});

const polling = effect(
	[ref(identities), client],
	async ([ref, client], scope) => {
		const interval = setInterval(async () => {
			const users = await client("get.users");
			scope.update(ref, () => users);
		}, 10000);

		return () => clearInterval(interval);
	},
);

const requestUpdate = provide(
	[ref(identities), client],
	async ([ref, client], scope) => {
		return async () => {
			const users = await client("get.users");
			scope.update(ref, () => users);
		};
	},
);

export const store = {
	identities,
	polling,
	requestUpdate,
};
