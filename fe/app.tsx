import { ScopeProvider, useReset, useResolveMany } from "@pumped-fn/react";
import { Suspense } from "react";
import { store } from "./store.pumped";
import { client } from "./client";
import { provide, mutable, ref } from "@pumped-fn/core";

export function App() {
	return (
		<>
			<ScopeProvider>
				<Suspense>
					<AppInner />
				</Suspense>
			</ScopeProvider>
		</>
	);
}

function AppInner() {
	const [identities, polling] = useResolveMany(store.identities, store.polling);
	return (
		<>
			<AddUserForm />
			{identities.map((identity) => (
				<div key={identity.id}>{identity.username}</div>
			))}
		</>
	);
}

const userForm = mutable(() => ({ username: "" }));
const updateForm = provide([ref(userForm)], ([ref], scope) => {
	return {
		setUsername: (username: string) => {
			scope.update(ref, () => ({ username }));
		},
	};
});

const form = { userForm, updateForm };

function AddUserForm() {
	const [userForm, updateForm, requestUpdate, _client] = useResolveMany(
		form.userForm,
		form.updateForm,
		store.requestUpdate,
		client,
	);
	const resetForm = useReset(form.userForm);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await _client("create.user", { username: userForm.username });
		resetForm();
		await requestUpdate();
	};

	return (
		<form onSubmit={handleSubmit}>
			<h1>Add User</h1>
			<input
				type="text"
				value={userForm.username}
				onChange={(e) => updateForm.setUsername(e.target.value)}
			/>
			<button type="submit">Add</button>
		</form>
	);
}
