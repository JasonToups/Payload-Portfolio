// src/resend/template.ts
import type { EmailLayout, Media } from '../payload-types'
import { resolvePayloadImageUrl } from '../utilities/blobUrl'

const PLATFORM_LABELS: Record<string, string> = {
  twitter: 'Twitter',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  github: 'GitHub',
  website: 'Website',
}

function resolveLogoUrl(logo: ((number | null) | Media) | undefined | null): string | null {
  return resolvePayloadImageUrl(logo as Media | number | null | undefined, {
    size: 'thumbnail',
    email: true,
  })
}

/**
 * Renders a complete email-safe HTML document from a body fragment and an
 * EmailLayout global record. Uses table-based layout with all inline styles
 * for consistent rendering across Gmail, Outlook, Apple Mail, etc.
 *
 * The unsubscribe link placeholder {{{RESEND_UNSUBSCRIBE_URL}}} is replaced
 * by Resend at send time for broadcast emails.
 */
export function renderEmailTemplate(bodyHtml: string, layout: EmailLayout): string {
  const header = layout.header ?? {}
  const footer = layout.footer

  const headerBg = header.bgColor ?? '#1e1c18'
  const headerText = header.textColor ?? '#f5f3ef'
  const footerBg = footer.bgColor ?? '#f0ede8'
  const footerTextColor = footer.textColor ?? '#7a7570'

  const logoUrl = resolveLogoUrl(header.logo)

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="Logo" width="160" style="max-width:160px;height:auto;display:block;margin:0 auto;" />`
    : ''

  const taglineHtml = header.tagline
    ? `<p style="margin:14px 0 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${headerText};opacity:0.65;font-family:'Courier New',Courier,monospace;">${header.tagline}</p>`
    : ''

  const socialLinksHtml = (footer.socialLinks ?? [])
    .map(
      ({ platform, url }) =>
        `<a href="${url}" target="_blank" style="color:${footerTextColor};text-decoration:none;margin:0 10px;font-size:12px;letter-spacing:0.08em;font-family:'Courier New',Courier,monospace;">${PLATFORM_LABELS[platform] ?? platform}</a>`,
    )
    .join('')

  const unsubscribeText = footer.unsubscribeText ?? 'Unsubscribe from this list'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Spectral:wght@600;700;800&display=swap');
    h1,h2,h3,h4,h5,h6 { font-family:'Spectral',Georgia,'Times New Roman',serif; color:#1e1c18; }
    p { margin:0 0 1em; }
    a { color:#2d7a95; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f3ef;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#f5f3ef;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color:${headerBg};padding:28px 40px;border-radius:8px 8px 0 0;">
              ${logoHtml}
              ${taglineHtml}
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 48px;color:#1e1c18;font-size:16px;line-height:1.65;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;border-left:1px solid #e2ddd6;border-right:1px solid #e2ddd6;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color:${footerBg};padding:28px 40px;border-radius:0 0 8px 8px;border:1px solid #e2ddd6;border-top:none;">
              ${
                socialLinksHtml
                  ? `<p style="margin:0 0 16px;line-height:1.6;">${socialLinksHtml}</p>`
                  : ''
              }
              ${
                footer.footerText
                  ? `<p style="margin:0 0 8px;font-size:13px;color:${footerTextColor};font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;">${footer.footerText}</p>`
                  : ''
              }
              <p style="margin:0 0 8px;font-size:12px;color:${footerTextColor};font-family:'Courier New',Courier,monospace;letter-spacing:0.04em;">${footer.mailingAddress}</p>
              <p style="margin:0;font-size:12px;font-family:'Courier New',Courier,monospace;letter-spacing:0.04em;">
                <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${footerTextColor};text-decoration:underline;">${unsubscribeText}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
