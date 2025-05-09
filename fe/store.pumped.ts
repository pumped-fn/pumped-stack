import { derive } from "@pumped-fn/core-next";
import { caller } from "./client";

const identities = derive([caller], async ([caller]) => {
  const users = await caller("get.users");
  return users;
});

const polling = derive(
  [identities.static, caller],
  async ([ref, caller]) => {
    const interval = setInterval(async () => {
      const users = await caller("get.users");
      ref.update(users);
    }, 10000);

    return () => clearInterval(interval);
  },
);

const requestUpdate = derive(
  [identities.static, caller],
  async ([ref, caller]) => {
    return async () => {
      const users = await caller("get.users");
      ref.update(users);
    };
  },
);

export const store = {
  identities,
  polling,
  requestUpdate,
};
