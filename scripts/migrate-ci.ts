/**
 * CI-safe Payload migration runner for Vercel builds.
 *
 * The standard `payload migrate` CLI uses the `prompts` library with `initial: false`
 * and `onCancel: () => process.exit(0)`. In Vercel's non-TTY build environment stdin
 * is closed, so prompts fires onCancel immediately and exits with code 0 — the migration
 * is silently skipped and `&&` lets the build proceed without the column ever being added.
 *
 * Additionally, `--force-accept-warning` is only wired to `migrate:fresh` and
 * `migrate:create` in the CLI source; it is never passed to `adapter.migrate()`.
 *
 * Fix: use prompts.override() — the library's own API for injecting answers — before
 * calling adapter.migrate(). Both this file and @payloadcms/drizzle's migrate.js share
 * the same cached Node module instance, so the override applies to the internal call.
 */
// @ts-expect-error — prompts ships no type declarations
import prompts from 'prompts'
import { getPayload } from 'payload'
import config from '../src/payload.config'

// Answer 'yes' to the dev-mode warning prompt without user interaction.
prompts.override({ confirm: true })

process.env.PAYLOAD_MIGRATING = 'true'

const payload = await getPayload({ config, disableOnInit: true })
await payload.db.migrate()
await payload.db.destroy?.()

process.exit(0)
