import "./globals.css";

export const metadata = {
  title: "EcoSphere: Connected ESG Observatory & Management Platform",
  description: "Next-generation Environmental, Social and Governance (ESG) ERP integration system.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
