/* Payload admin layout */
import config from "@payload-config";
import "@payloadcms/next/css";
import "./custom.scss";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import React from "react";
import { importMap } from "./admin/importMap.js";

type Args = { children: React.ReactNode };

// Payload CMS requires serverFunction to accept any type of args
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Payload CMS server function signature requirement
async function serverFunction(args: any) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
