import { Providers } from "./providers";
import { SocketProvider } from "@/context/SocketContext";

export default function Layout({
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
