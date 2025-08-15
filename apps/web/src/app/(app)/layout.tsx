import { Providers } from "./providers";
import { SocketProvider } from "@/context/SocketContext";

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {

  return (
    <SocketProvider>
    <Providers>
      {children}
      {modal}
    </Providers>
    </SocketProvider>
  );
}
