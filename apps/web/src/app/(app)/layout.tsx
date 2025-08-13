import { Providers } from "./providers";
import { SocketProvider } from "@/context/SocketContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <SocketProvider>
    <Providers>
      {children}
    </Providers>
    </SocketProvider>
  );
}
