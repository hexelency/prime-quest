import Image from "next/image";

const facebookHref = "https://www.facebook.com/share/1CT3Bc6jrf/";
const linkedInHref =
  "https://www.linkedin.com/in/ugochukwu-lawrence-festus-94470a439";
const instagramHref = "https://www.instagram.com/primequest2026/";

export default function PublicCredentials() {
  return (
    <section
      className="public-credentials"
      aria-label="PrimeQuest leadership and company details"
    >
      <div className="shell public-credentials-inner">

        <div className="public-credentials-portraits" aria-hidden="true">
          <Image
            src="/ceo-pics/WhatsApp%20Image%202026-09-23%20at%2001.28.26.jpeg"
            alt=""
            width={84}
            height={84}
          />

          <Image
            src="/ceo-pics/WhatsApp%20Image%202026-09-23%20at%2001.28.25.jpeg"
            alt=""
            width={84}
            height={84}
          />
        </div>

        <div className="public-credentials-copy">
          <p className="eyebrow accent">
            Leadership & accountability
          </p>

          <strong>
            Mr. Ugochukwu Lawrence Festus · CEO
          </strong>

          <span>
            PrimeQuest Oil and Properties Consultants · Asaba, Delta State,
            Nigeria
          </span>
          <div className="public-credentials-links">

          {/* Email */}
          <a
            href="mailto:info@primequest.com.ng"
            aria-label="Email PrimeQuest"
            title="Email PrimeQuest"
          >
            <span className="social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 5h18v14H3V5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="m3 6 9 7 9-7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>Email</span>
            <span className="social-arrow">↗</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/2348038128933"
            target="_blank"
            rel="noreferrer"
            aria-label="PrimeQuest on WhatsApp"
            title="WhatsApp"
          >
            <span className="social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M20.5 11.4a8.3 8.3 0 0 1-12.3 7.3L4 20l1.4-4.1A8.3 8.3 0 1 1 20.5 11.4Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M8.2 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.1.5-.4.7-.4.3-1 .4-1.5.2-2.8-.8-5-3-5.8-5.8-.2-.5-.1-1.1.2-1.7Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span>WhatsApp</span>
            <span className="social-arrow">↗</span>
          </a>

          {/* Facebook */}
          <a
            href={facebookHref}
            target="_blank"
            rel="noreferrer"
            aria-label="PrimeQuest on Facebook"
            title="Facebook"
          >
            <span className="social-icon social-icon-facebook" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H8.2v3h2.6v8h2.7Z" />
              </svg>
            </span>
            <span>Facebook</span>
            <span className="social-arrow">↗</span>
          </a>

          {/* LinkedIn */}
          <a
            href={linkedInHref}
            target="_blank"
            rel="noreferrer"
            aria-label="PrimeQuest on LinkedIn"
            title="LinkedIn"
          >
            <span className="social-icon social-icon-linkedin" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.2 8.1A1.7 1.7 0 1 0 6.2 4.7a1.7 1.7 0 0 0 0 3.4ZM4.8 9.5h2.8V19H4.8V9.5Zm4.6 0h2.7v1.3h.1c.4-.8 1.4-1.7 2.9-1.7 3.1 0 3.7 2 3.7 4.6V19H16v-4.7c0-1.1 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5V19H9.4V9.5Z" />
              </svg>
            </span>
            <span>LinkedIn</span>
            <span className="social-arrow">↗</span>
          </a>

          {/* Instagram */}
          <a
            href={instagramHref}
            target="_blank"
            rel="noreferrer"
            aria-label="PrimeQuest on Instagram"
            title="Instagram"
          >
            <span className="social-icon social-icon-instagram" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="3.5"
                  y="3.5"
                  width="17"
                  height="17"
                  rx="4.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="17.5"
                  cy="6.7"
                  r="1"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span>Instagram</span>
            <span className="social-arrow">↗</span>
          </a>

        </div>
        </div>

        
      </div>
    </section>
  );
}