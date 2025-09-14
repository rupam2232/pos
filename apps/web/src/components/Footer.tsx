export default function Footer() {
  return (
    <footer className="py-12 text-center text-gray-400 text-sm">
      © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.
    </footer>
  );
}
