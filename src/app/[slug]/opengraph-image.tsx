import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Your websites can be your best salespeople — Monday + Partners";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#041c45",
          backgroundImage: "linear-gradient(180deg, #041c45 0%, #020f24 100%)",
          padding: "60px",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "200px",
            width: "400px",
            height: "400px",
            background: "rgba(212, 168, 67, 0.08)",
            borderRadius: "50%",
            filter: "blur(100px)",
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            fontWeight: 300,
            color: "rgba(255, 255, 255, 0.5)",
            letterSpacing: "0.2em",
            marginBottom: "60px",
          }}
        >
          MONDAY + PARTNERS
        </div>

        {/* Main headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 200,
              color: "rgba(255, 255, 255, 0.9)",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Your websites can be
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 300,
              fontStyle: "italic",
              color: "#d4a843",
              lineHeight: 1.1,
            }}
          >
            your best salespeople.
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            fontWeight: 300,
            color: "rgba(255, 255, 255, 0.4)",
            marginTop: "48px",
          }}
        >
          Project Proposal
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
