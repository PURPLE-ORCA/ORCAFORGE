import { asyncMap } from "convex-helpers";
import type { Id } from "../_generated/dataModel";

const NON_STORAGE_PREFIXES = ["http://", "https://", "data:", "blob:", "/"];

function isLikelyStorageId(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  const lower = trimmed.toLowerCase();
  return !NON_STORAGE_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function isIgnorableStorageDeleteError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    (message.includes("storage id") && message.includes("not found")) ||
    (message.includes("invalid argument") && message.includes("storageid"))
  );
}

export async function resolveImageUrl(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  value: string | Id<"_storage"> | null | undefined,
): Promise<string> {
  if (!value) return "";
  if (typeof value === "string" && value.startsWith("http")) return value;
  return (await ctx.storage.getUrl(value as Id<"_storage">)) ?? "";
}

export function isStorageId(
  value: string | Id<"_storage">,
): value is Id<"_storage"> {
  return typeof value === "string" && isLikelyStorageId(value);
}

export async function resolveGalleryImages(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  images: (string | Id<"_storage">)[] | null | undefined,
): Promise<string[]> {
  if (!images || images.length === 0) return [];
  const urls = await asyncMap(images, (img) => resolveImageUrl(ctx, img));
  return urls.filter((url): url is string => !!url);
}

export async function resolveImageWithId(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  value: string | Id<"_storage"> | null | undefined,
): Promise<{ url: string; id: string | Id<"_storage"> | undefined }> {
  if (!value) return { url: "", id: undefined };
  if (typeof value === "string" && value.startsWith("http")) {
    return { url: value, id: value };
  }
  const url = (await ctx.storage.getUrl(value as Id<"_storage">)) ?? "";
  return { url, id: value };
}

export async function resolveGalleryWithIds(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  images: (string | Id<"_storage">)[] | null | undefined,
): Promise<{ urls: string[]; ids: (string | Id<"_storage"> | undefined)[] }> {
  if (!images || images.length === 0) return { urls: [], ids: [] };
  const results = await asyncMap(images, (img) => resolveImageWithId(ctx, img));
  return {
    urls: results.map((r) => r.url).filter(Boolean),
    ids: results.map((r) => r.id),
  };
}

export async function deleteStorageImages(
  ctx: { storage: { delete: (id: Id<"_storage">) => Promise<void> } },
  images: (string | Id<"_storage">)[] | null | undefined,
): Promise<void> {
  if (!images || images.length === 0) return;

  const storageIds = Array.from(new Set(images.filter(isStorageId)));

  if (storageIds.length > 0) {
    await asyncMap(storageIds, async (id) => {
      try {
        await ctx.storage.delete(id);
      } catch (error) {
        if (isIgnorableStorageDeleteError(error)) return;
        throw error;
      }
    });
  }
}

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| // 1. Inside a Convex Query (Resolving IDs to public URLs for the frontend):
| export const getProfile = query({
|   args: { userId: v.id("users") },
|   handler: async (ctx, args) => {
|     const user = await ctx.db.get(args.userId);
|     return {
|       ...user,
|       avatarUrl: await resolveImageUrl(ctx, user.avatarId),
|       galleryUrls: await resolveGalleryImages(ctx, user.galleryIds),
|     };
|   },
| });
|
| // 2. Inside a Convex Mutation (Cleaning up old files when replacing them):
| export const updateAvatar = mutation({
|   args: { userId: v.id("users"), newAvatarId: v.optional(v.id("_storage")) },
|   handler: async (ctx, args) => {
|     const user = await ctx.db.get(args.userId);
|     
|     // If they uploaded a new avatar, safely delete the old one
|     if (args.newAvatarId && user.avatarId) {
|       await deleteStorageImages(ctx, [user.avatarId]);
|     }
|
|     await ctx.db.patch(args.userId, { avatarId: args.newAvatarId });
|   },
| });
|
*/
