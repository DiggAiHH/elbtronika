import {
  aiDecisionSchema,
  artistSchema,
  artworkSchema,
  auditEventSchema,
  consentLogSchema,
  djSchema,
  orderSchema,
  profileSchema,
  roomSchema,
  setSchema,
  transactionSchema,
  webhookEventSchema,
} from './schemas.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

export function snakeToCamelObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => snakeToCamelObject(entry))
  }

  if (!isRecord(value)) {
    return value
  }

  const mapped: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value)) {
    mapped[snakeToCamelKey(key)] = snakeToCamelObject(entry)
  }

  return mapped
}

function asLocalizedString(deValue: unknown, enValue: unknown): { de: string; en?: string } {
  const de = typeof deValue === 'string' ? deValue : ''
  const en = typeof enValue === 'string' ? enValue : undefined
  if (en === undefined) {
    return { de }
  }
  return { de, en }
}

function asOptionalLocalizedText(deValue: unknown, enValue: unknown): { de?: string; en?: string } {
  const value: { de?: string; en?: string } = {}
  if (typeof deValue === 'string') value.de = deValue
  if (typeof enValue === 'string') value.en = enValue
  return value
}

function readRefId(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (!isRecord(value)) return undefined
  return typeof value._ref === 'string' ? value._ref : undefined
}

export function mapDbProfileRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return profileSchema.parse(base)
}

export function mapDbArtistRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return artistSchema.parse({
    profileId: base.profileId,
    bio: asOptionalLocalizedText(base.bioDe, base.bioEn),
    portraitUrl: base.portraitUrl,
    socialLinks: isRecord(base.socialLinks) ? base.socialLinks : {},
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  })
}

export function mapDbDjRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return djSchema.parse({
    profileId: base.profileId,
    bio: asOptionalLocalizedText(base.bioDe, base.bioEn),
    portraitUrl: base.portraitUrl,
    soundcloudHandle: base.soundcloudHandle,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  })
}

export function mapDbRoomRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return roomSchema.parse({
    id: base.id,
    slug: base.slug,
    name: asLocalizedString(base.nameDe, base.nameEn),
    sceneConfig: isRecord(base.sceneConfig) ? base.sceneConfig : {},
    createdAt: base.createdAt,
  })
}

export function mapDbSetRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return setSchema.parse({
    id: base.id,
    slug: base.slug,
    djId: base.djId,
    title: asLocalizedString(base.titleDe, base.titleEn),
    hlsManifestUrl: base.hlsManifestUrl,
    soundcloudTrackId: base.soundcloudTrackId,
    durationSeconds: base.durationSeconds,
    coverArtworkId: base.coverArtworkId,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  })
}

export function mapDbArtworkRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return artworkSchema.parse({
    id: base.id,
    slug: base.slug,
    artistId: base.artistId,
    djId: base.djId,
    roomId: base.roomId,
    setId: base.setId,
    title: asLocalizedString(base.titleDe, base.titleEn),
    story: {
      de: Array.isArray(base.storyDe) ? base.storyDe : [],
      en: Array.isArray(base.storyEn) ? base.storyEn : [],
    },
    priceCents: base.priceCents,
    currency: base.currency,
    medium: asOptionalLocalizedText(base.medium, undefined),
    dimensions: isRecord(base.dimensions) ? base.dimensions : {},
    imageUrl: base.imageUrl,
    gltfUrl: base.gltfUrl,
    textures: Array.isArray(base.textures)
      ? base.textures.filter((item): item is string => typeof item === 'string')
      : [],
    status: base.status,
    publishedAt: base.publishedAt,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  })
}

export function mapDbOrderRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return orderSchema.parse(base)
}

export function mapDbTransactionRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return transactionSchema.parse(base)
}

export function mapDbConsentLogRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return consentLogSchema.parse(base)
}

export function mapDbAuditEventRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return auditEventSchema.parse(base)
}

export function mapDbWebhookEventRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return webhookEventSchema.parse(base)
}

export function mapDbAiDecisionRow(row: Record<string, unknown>) {
  const base = snakeToCamelObject(row) as Record<string, unknown>
  return aiDecisionSchema.parse(base)
}

export function mapSanityArtworkDocument(doc: Record<string, unknown>) {
  const title = isRecord(doc.title) ? doc.title : {}
  const story = isRecord(doc.story) ? doc.story : {}
  const medium = isRecord(doc.medium) ? doc.medium : {}

  return artworkSchema.parse({
    id: String(doc._id ?? ''),
    slug: isRecord(doc.slug) && typeof doc.slug.current === 'string' ? doc.slug.current : '',
    artistId: readRefId(doc.artist),
    djId: readRefId(doc.dj),
    roomId: readRefId(doc.room),
    setId: readRefId(doc.set),
    title: asLocalizedString(title.de, title.en),
    story: {
      de: Array.isArray(story.de) ? story.de : [],
      en: Array.isArray(story.en) ? story.en : [],
    },
    priceCents: Number(doc.priceCents ?? 0),
    currency: typeof doc.currency === 'string' ? doc.currency : 'EUR',
    medium: asOptionalLocalizedText(medium.de, medium.en),
    dimensions: isRecord(doc.dimensions) ? doc.dimensions : {},
    imageUrl: typeof doc.imageUrl === 'string' ? doc.imageUrl : null,
    gltfUrl: typeof doc.gltfUrl === 'string' ? doc.gltfUrl : null,
    textures: Array.isArray(doc.textures)
      ? doc.textures
          .map((entry) => (isRecord(entry) && typeof entry.url === 'string' ? entry.url : undefined))
          .filter((entry): entry is string => Boolean(entry))
      : [],
    status: typeof doc.status === 'string' ? doc.status : 'draft',
    publishedAt: typeof doc.publishedAt === 'string' ? doc.publishedAt : null,
    createdAt: typeof doc._createdAt === 'string' ? doc._createdAt : new Date(0).toISOString(),
    updatedAt: typeof doc._updatedAt === 'string' ? doc._updatedAt : new Date(0).toISOString(),
  })
}

