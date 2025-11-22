"use client";

import React, { createContext, JSX, useReducer } from "react";

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

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
