import { createContext, useContext } from "react";
import { useInit } from "@instantdb/react";

type Auth = NonNullable<ReturnType<typeof useInit>["2"]>;

const AuthContext = createContext<Auth>(undefined as any);

export const AuthProvider = AuthContext.Provider;

export const useAuth = () => useContext(AuthContext);
