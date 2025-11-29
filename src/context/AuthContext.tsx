"use client";

import { VERIFY_AUTHORIZATION } from "@/actions/userActions";
import React, { createContext, JSX, useEffect, useReducer } from "react";

export const AuthContext = createContext({});

const initialState = {
  user: null,
};

const reducer = (
  state: { user: any },
  action: { type: string; payload?: any }
) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
};

export function AuthProvider({
  children,
}: {
  children:
    | React.ReactElement
    | React.ReactElement[]
    | JSX.Element
    | JSX.Element[]
    | React.ReactNode
    | React.ReactNode[];
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = (user: any) => dispatch({ type: "LOGIN", payload: user });

  const logout = () => dispatch({ type: "LOGOUT" });

  async function fetchUser() {
    try {
      const { data, success, message } = await VERIFY_AUTHORIZATION();
      if (!success) {
        throw new Error(message);
      }

      login(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      logout();
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
