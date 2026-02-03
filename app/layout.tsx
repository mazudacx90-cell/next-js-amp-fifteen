// This provides the HTML shell for your app.
export const metadata = {
  title: 'Next Amp Fifteen',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}