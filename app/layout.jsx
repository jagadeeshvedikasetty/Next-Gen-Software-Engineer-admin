import './globals.css';
import './App.css';

export const metadata = {
  title: 'Portfolio Admin',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
