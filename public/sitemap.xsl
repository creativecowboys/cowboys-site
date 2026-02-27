<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Sitemap — Creative Cowboys</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0D0D0F;
            color: #e5e5e5;
            padding: 40px 20px;
            min-height: 100vh;
          }
          .container { max-width: 900px; margin: 0 auto; }
          header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 40px;
            padding-bottom: 24px;
            border-bottom: 1px solid #2a2a2a;
          }
          header svg { flex-shrink: 0; }
          header h1 {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(90deg, #fff 0%, #a3a3a3 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          header p {
            font-size: 13px;
            color: #6b7280;
            margin-top: 4px;
          }
          .badge {
            display: inline-block;
            background: #1e3a2a;
            color: #4ade80;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 10px;
            border-radius: 99px;
            margin-left: 10px;
            vertical-align: middle;
            letter-spacing: 0.04em;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #141416;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 32px rgba(0,0,0,0.4);
          }
          thead tr {
            background: #1a1a1c;
          }
          th {
            padding: 14px 20px;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #6b7280;
            border-bottom: 1px solid #222;
          }
          td {
            padding: 14px 20px;
            font-size: 14px;
            border-bottom: 1px solid #1c1c1e;
            vertical-align: middle;
          }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: #1a1a1e; }
          td a {
            color: #60a5fa;
            text-decoration: none;
            word-break: break-all;
          }
          td a:hover { color: #93c5fd; text-decoration: underline; }
          .priority-pill {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 99px;
            font-size: 12px;
            font-weight: 600;
          }
          .pri-high  { background: #1e3a2a; color: #4ade80; }
          .pri-med   { background: #1a2e3a; color: #60a5fa; }
          .pri-low   { background: #2a2a1e; color: #fbbf24; }
          .change    { color: #9ca3af; font-size: 13px; }
          .lastmod   { color: #6b7280; font-size: 13px; }
          footer {
            margin-top: 32px;
            text-align: center;
            font-size: 12px;
            color: #374151;
          }
          footer a { color: #4b5563; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#1a1a1c"/>
              <path d="M10 20 L20 10 L30 20 L20 30 Z" fill="none" stroke="#60a5fa" stroke-width="2"/>
              <circle cx="20" cy="20" r="3" fill="#60a5fa"/>
            </svg>
            <div>
              <h1>Creative Cowboys <span class="badge">Sitemap</span></h1>
              <p>All indexed pages — submitted to Google Search Console</p>
            </div>
          </header>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>URL</th>
                <th>Priority</th>
                <th>Change Freq</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <xsl:variable name="pri" select="sitemap:priority"/>
                <tr>
                  <td style="color:#4b5563;font-size:12px;width:40px;">
                    <xsl:value-of select="position()"/>
                  </td>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="$pri >= 0.9">
                        <span class="priority-pill pri-high"><xsl:value-of select="$pri"/></span>
                      </xsl:when>
                      <xsl:when test="$pri >= 0.7">
                        <span class="priority-pill pri-med"><xsl:value-of select="$pri"/></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="priority-pill pri-low"><xsl:value-of select="$pri"/></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td class="change"><xsl:value-of select="sitemap:changefreq"/></td>
                  <td class="lastmod"><xsl:value-of select="sitemap:lastmod"/></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <footer>
            <p>&#169; 2025 <a href="https://creativecowboys.co">Creative Cowboys</a> · All rights reserved</p>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
