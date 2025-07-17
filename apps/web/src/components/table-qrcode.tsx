import React, { useCallback, useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { IconQrcode } from "@tabler/icons-react";
import Image from "next/image";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { toPng } from "html-to-image";

const TableQRCode = ({
  qrCodeData,
  qrCodeImage,
  qrCodeName = "table-qrcode",
  slug,
}: {
  qrCodeData: string;
  qrCodeImage?: string;
  qrCodeName?: string;
  slug?: string;
}) => {
  const [fileExt, setFileExt] = useState<"png" | "jpeg" | "webp">("png");
  const qrCode = useRef<QRCodeStyling | null>(null);
  const [open, setOpen] = useState(false);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(
    () => {
      if (open) {
        if (!qrCode.current) {
          qrCode.current = new QRCodeStyling({
            width: 1200,
            height: 1200,
            image: qrCodeImage,
            data: qrCodeData || "https://example.com",
            margin: 30,
            dotsOptions: {
              color: "#000000",
              type: "rounded",
            },
            backgroundOptions: {
              color: "#ffffff",
            },
            imageOptions: {
              crossOrigin: "anonymous",
              margin: 20,
            },
            qrOptions: {
              errorCorrectionLevel: "H", // High error correction for logo overlay
            },
          });
        }
        qrCode.current.getRawData("png").then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setQrSrc(reader.result as string); // Base64 data URL
          };
          reader.readAsDataURL(blob as Blob);
        });
      }
      // Cleanup
      return () => {
        if (qrSrc) URL.revokeObjectURL(qrSrc);
      };
    },
    // eslint-disable-next-line
    [open, qrCodeData, qrCodeImage]
  );

  const onExtensionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    setFileExt(event.target.value as "png" | "jpeg" | "webp");
  };

  const onButtonClick = useCallback(() => {
    if (ref.current === null || !isImageLoaded) {
      console.error("Ref is null or image not loaded yet");
      return;
    }
    console.log(ref.current);
    toPng(ref.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${qrCodeName.replaceAll(" ", "-")}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  }, [ref, qrCodeName, isImageLoaded]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger className="w-min [&_svg]:size-6! p-5 absolute top-0 right-4 bg-transparent hover:bg-secondary/10 text-primary border border-accent-foreground/60">
            <IconQrcode />
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Generate QR Code</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <ScrollArea className="overflow-y-auto max-h-[90vh]">
          <DialogHeader className="p-6">
            <DialogTitle>QR Code</DialogTitle>
            <div>
              <div>
                <select onChange={onExtensionChange} value={fileExt}>
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WEBP</option>
                </select>
                <button onClick={onButtonClick}>Download</button>
              </div>
            </div>
            <div className="mx-auto">
              <div
                ref={ref}
                className="flex items-center justify-center flex-col p-4 my-4 bg-white rounded-md"
                style={{ width: "400px", height: "500px" }}
              >
                {/* QR Code */}
                <Image
                  src={qrSrc || "/placeholder-logo.png"}
                  alt="QR Code"
                  width={150}
                  height={150}
                  style={{ marginBottom: "20px" }}
                  onLoad={() => setIsImageLoaded(true)}
                  draggable={false}
                  className={`object-contain rounded-md ${qrSrc ? "" : "hidden"}`}
                />

                {/* Branding */}
                <Image
                  src="/placeholder-logo.png"
                  alt="Brand Logo"
                  width={100}
                  height={100}
                  style={{ marginBottom: "20px" }}
                  draggable={false}
                  className={`object-contain rounded-md ${qrSrc ? "" : "hidden"}`}
                />

                {/* Instructions */}
                <p
                  style={{
                    fontSize: "16px",
                    color: "#333",
                    textAlign: "center",
                  }}
                >
                  Scan the QR code to visit our website!
                </p>
              </div>
            </div>
            {/* <canvas
              width="300"
              id="fabric-canvas"
              height="300"
              ref={handleCanvasRef}
              className="border"
            /> */}
            <DialogClose />
          </DialogHeader>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TableQRCode;
