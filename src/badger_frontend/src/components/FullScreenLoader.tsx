import React, { PropsWithChildren } from "react";

export const FullScreenLoader: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="w-full h-screen flex justify-center items-center">{children}</div>;
};
