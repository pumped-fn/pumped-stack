import { effect, mutable, provide } from "@pumped-fn/core";
import { caller } from "./client";

const identities = mutable([caller], async ([caller]) => {
  const users = await caller("get.users");
  return users;
});

const polling = effect(
  [identities.ref, caller],
  async ([ref, caller], scope) => {
    const interval = setInterval(async () => {
      const users = await caller("get.users");
      scope.update(ref, () => users);
    }, 10000);

    return () => clearInterval(interval);
  },
);

const requestUpdate = provide(
  [identities.ref, caller],
  async ([ref, caller], scope) => {
    return async () => {
      const users = await caller("get.users");
      scope.update(ref, () => users);
    };
  },
);

export const store = {
  identities,
  polling,
  requestUpdate,
};
