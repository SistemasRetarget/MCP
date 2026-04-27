import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { Users } from "./src/collections/Users";
import { Media } from "./src/collections/Media";
import { Categories } from "./src/collections/Categories";
import { Tags } from "./src/collections/Tags";
import { Posts } from "./src/collections/Posts";
import { Pages } from "./src/collections/Pages";
import { Landings } from "./src/collections/Landings";
import { Sources } from "./src/collections/Sources";
import { Articles } from "./src/collections/Articles";
import { SiteSettings } from "./src/globals/SiteSettings";
import { AISettings } from "./src/globals/AISettings";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: "· CMS Universal",
      icons: [],
      description: "Panel de administración — CMS Universal"
    },
    components: {
      views: {
        dashboard: { Component: "@/components/admin/Dashboard#default" }
      },
      graphics: {
        Logo: "@/components/admin/Logo#default",
        Icon: "@/components/admin/Icon#default"
      }
    }
  },
  collections: [Users, Media, Categories, Tags, Posts, Pages, Landings, Sources, Articles],
  globals: [SiteSettings, AISettings],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || "dev-only-change-me",
  typescript: { outputFile: path.resolve(__dirname, "payload-types.ts") },
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URL || "file:./data/cms.db" } }),
  sharp,
  localization: {
    locales: [
      { label: "🇪🇸 Español", code: "es" },
      { label: "🇺🇸 English", code: "en" },
      { label: "🇧🇷 Português", code: "pt" }
    ],
    defaultLocale: "es",
    fallback: true
  },
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  cors: [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"]
});
