import React, { useEffect, useRef, useState } from "react";
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
  
  useEffect(
    () => {
      if (open) {
        if (!qrCode.current) {
          qrCode.current = new QRCodeStyling({
            width: 1200,
            height: 1200,
            image: qrCodeImage,
            data:
              qrCodeData ||
              "https://example.com",
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
          const url = URL.createObjectURL(blob as Blob);
          setQrSrc(url);
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

  const onDownloadClick = () => {
    qrCode.current?.download({
      name: qrCodeName.replaceAll(" ", "-"),
      extension: fileExt,
    });
  };

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
      <DialogContent className="p-4">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <div>
            <div>
              <select onChange={onExtensionChange} value={fileExt}>
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WEBP</option>
              </select>
              <button onClick={onDownloadClick}>Download</button>
            </div>
          </div>
          {qrSrc && (
            <Image
              src={qrSrc}
              height={200}
              width={200}
              alt="QR Code"
              className="object-contain"
            />
          )}
          <DialogClose />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default TableQRCode;
