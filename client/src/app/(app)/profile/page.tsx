"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteCurrentUser,
  updateCurrentPassword,
  updateCurrentUser,
} from "@/src/api/auth";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { getApiErrorMessage } from "@/src/lib/get-api-error";
import useAuthStore from "@/src/store/authStore";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await updateCurrentUser({ name, username, email });
      setAuth(response.data.user);
      setSuccess("Profile updated.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to update profile."));
    }
  };

  const onUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await updateCurrentPassword({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setSuccess("Password updated.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to update password."));
    }
  };

  const onDeleteAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await deleteCurrentUser(deletePassword);
      clearAuth();
      router.push("/");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to delete account."));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-100">Profile</h1>
      <p className="text-zinc-400">View your account details and preferences.</p>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400">Name</p>
        <p className="text-zinc-100">{user?.name ?? "-"}</p>
        <p className="mt-3 text-sm text-zinc-400">Username</p>
        <p className="text-zinc-100">{user?.username ?? "-"}</p>
        <p className="mt-3 text-sm text-zinc-400">Email</p>
        <p className="text-zinc-100">{user?.email ?? "-"}</p>
      </div>

      {error ? <p className="text-red-400">{error}</p> : null}
      {success ? <p className="text-emerald-400">{success}</p> : null}

      <form
        onSubmit={onUpdateProfile}
        className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2"
      >
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Username</Label>
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit">Save profile</Button>
        </div>
      </form>

      <form
        onSubmit={onUpdatePassword}
        className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2"
      >
        <div className="space-y-2">
          <Label>Old password</Label>
          <Input
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>New password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" variant="outline">
            Update password
          </Button>
        </div>
      </form>

      <form
        onSubmit={onDeleteAccount}
        className="grid gap-3 rounded-xl border border-red-900 bg-zinc-900 p-4"
      >
        <div className="space-y-2">
          <Label>Confirm password to delete account</Label>
          <Input
            type="password"
            value={deletePassword}
            onChange={(event) => setDeletePassword(event.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="ghost">
          Delete account
        </Button>
      </form>
    </div>
  );
}
