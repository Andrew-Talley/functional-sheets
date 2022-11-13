import { useState } from "react";
import { auth } from "@instantdb/react";

export function Login() {
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="p-16 shadow h-max">
        <h1 className="mb-8 text-2xl">Login</h1>
        {!sentEmail ? (
          <div className="flex flex-col">
            <h2 className="text-xl">Enter your email for login:</h2>
            <form
              className="flex flex-col my-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await auth.sendMagicCode({ email });
                  setSentEmail(true);
                } catch {
                  setError("Failed to send email");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                value={email}
                placeholder="Email"
                aria-invalid={Boolean(error)}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="mt-4">
                Send Code
              </button>
              {error && (
                <label className="text-red-500" htmlFor="email">
                  {error}
                </label>
              )}
            </form>
          </div>
        ) : (
          <div className="flex flex-col">
            <h2>Enter the code from your email</h2>
            <form
              className="flex flex-col my-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await auth.verifyMagicCode({ email, code });
                } catch {
                  setError("Failed to verify code...");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <label htmlFor="code">Code</label>
              <input
                id="code"
                name="code"
                placeholder="Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button type="submit">Submit Code</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
