# Legal Disclaimer & Acceptable Use Policy

**ROM Scraper / AFJORD v1.0.8**
**Last Updated: March 2026**

---

## Purpose

ROM Scraper (codename "AFJORD") is a desktop media collection and content migration tool developed for internal use by Ryan's Outdoor Media. It is designed to assist with legitimate tasks such as:

- Migrating media assets between websites during redesigns or platform changes
- Archiving publicly available content from your own web properties
- Collecting media from sites where you have explicit authorization
- Backing up content you own or have licensed rights to use

## User Responsibility

**You, the user, are solely responsible for how you use this software.** By using ROM Scraper, you acknowledge and agree to the following:

1. **Compliance with Laws** — You will comply with all applicable local, state, national, and international laws and regulations, including but not limited to:
   - The Computer Fraud and Abuse Act (CFAA) in the United States
   - The General Data Protection Regulation (GDPR) in the European Union
   - The Copyright Act and Digital Millennium Copyright Act (DMCA)
   - Any equivalent legislation in your jurisdiction

2. **Terms of Service** — You are responsible for reviewing and complying with the Terms of Service, Terms of Use, and any other agreements governing the websites you interact with using this tool. Many websites explicitly prohibit automated access, scraping, or data collection in their terms.

3. **Copyright & Intellectual Property** — You will not use this tool to download, copy, reproduce, or distribute copyrighted material without proper authorization from the rights holder. Downloading content does not grant you ownership or redistribution rights.

4. **Personal Data & Privacy** — You will not use this tool to collect, harvest, or process personal data or personally identifiable information (PII) of any individual without their explicit consent and a lawful basis for processing under applicable privacy laws.

5. **Authorization** — You will only use this tool on websites and systems where you have explicit permission or legal right to perform automated data collection. Unauthorized access to computer systems is a criminal offense in most jurisdictions.

## Stealth & Anti-Detection Features

This software includes features designed to manage request patterns and HTTP headers (such as user-agent rotation, request jitter, header spoofing, and the ROMAGENT orchestration engine). These features exist to:

- Reduce server load by implementing polite crawling practices (delays, backoff)
- Maintain compatibility with websites that block default or empty user-agent strings
- Mimic standard browser behavior for proper content delivery
- Respect rate limits and avoid overwhelming target servers

**These features are NOT intended to:**
- Circumvent access controls, authentication systems, or paywalls
- Bypass security measures designed to protect private or restricted content
- Enable unauthorized access to any computer system or network
- Evade detection for the purpose of violating any law or Terms of Service

## Robots.txt & Rate Limiting

ROM Scraper includes a "Respect robots.txt" option that is **enabled by default**. Users are strongly encouraged to:

- Keep this option enabled at all times
- Set appropriate request delays (minimum 0.5 seconds recommended)
- Use conservative file limits to avoid excessive server load
- Stop scraping immediately if you receive HTTP 403 (Forbidden) or 429 (Too Many Requests) responses, as these indicate the site operator does not want automated access

## Session Cookies

The session cookie feature allows authenticated access to sites where you have a valid account. This feature is intended for:

- Downloading your own content from platforms where login is required
- Accessing media you have permission to collect
- Migrating content from your own social media accounts or business pages

It is NOT intended for accessing other users' private or restricted content.

## No Warranty

THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS, DEVELOPERS, OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Limitation of Liability

The developers of ROM Scraper:

- Make no representations about the legality of scraping any particular website
- Are not responsible for any legal consequences resulting from your use of this tool
- Do not endorse or encourage any use of this tool that violates applicable laws or Terms of Service
- Are not liable for any data loss, service disruptions, or damages arising from the use of this software

## Indemnification

By using this software, you agree to indemnify and hold harmless the developers, contributors, and distributors of ROM Scraper from any claims, damages, losses, or expenses (including legal fees) arising from your use or misuse of this tool.

## Ethical Use Guidelines

We encourage all users to:

- Only scrape content you own, have licensed, or have explicit permission to collect
- Respect website operators' wishes as expressed through robots.txt and Terms of Service
- Use reasonable request delays to minimize server impact
- Stop immediately if asked by a site operator to cease automated access
- Never scrape personal data or private information
- Consider reaching out to website owners for API access or data export options before resorting to scraping

## Contact

If you are a website operator and believe this tool is being used to access your content without authorization, please contact the repository owner to report the issue.

---

**By downloading, installing, or using ROM Scraper, you acknowledge that you have read, understood, and agree to this disclaimer.**
