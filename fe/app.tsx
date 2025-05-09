import { ScopeProvider, useReset, useResolveMany } from "@pumped-fn/react";
import { Suspense } from "react";
import { store } from "./store.pumped";
import { caller } from "./client";
import { derive, provide } from "@pumped-fn/core-next";
import { appPumped } from "./app.pumped";

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
  const [identities, polling, setSelectedTodo] = useResolveMany(
    store.identities,
    store.polling,
    appPumped.setSelectedTodo,
  );
  return (
    <>
      <AddUserForm />
      {identities.map((identity) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          key={identity.id}
          onClick={() => {
            setSelectedTodo(identity);
          }}
        >
          {identity.username}
        </div>
      ))}
      <h2>Current user</h2>
      <hr />
      <SelectedUser />
    </>
  );
}

const userForm = provide(() => ({ username: "" }));
const updateForm = derive(userForm.static, (ref) => {
  return {
    setUsername: (username: string) => {
      ref.update(() => ({ username }));
    },
  };
});

const form = { userForm, updateForm };

function AddUserForm() {
  const [userForm, updateForm, requestUpdate, _client] = useResolveMany(
    form.userForm,
    form.updateForm,
    store.requestUpdate,
    caller,
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

function SelectedUser() {
  const [selectedUser, setSelectedTodo] = useResolveMany(
    appPumped.selectedTodo,
    appPumped.setSelectedTodo,
  );

  return (
    <>
      <div>{selectedUser ? selectedUser.username : "No user selected"}</div>
      <div>
        <button type="button" onClick={() => setSelectedTodo(undefined)}>
          Clear
        </button>
      </div>
    </>
  );
}
