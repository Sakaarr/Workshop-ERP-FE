"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseBarcodeResult {
  isScanning: boolean;
  lastScan: string | null;
  error: string | null;
  startScanning: () => void;
  stopScanning: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function useBarcodeScanner(
  onScan?: (code: string) => void,
): UseBarcodeResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopScanning = useCallback(() => {
    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch {}
      readerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    setError(null);
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/library");
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const devices = await reader.listVideoInputDevices();
      if (!devices.length) {
        setError("No camera found on this device");
        return;
      }

      // Prefer rear camera
      const device =
        devices.find(d =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("rear") ||
          d.label.toLowerCase().includes("environment"),
        ) ?? devices[0];

      setIsScanning(true);

      await reader.decodeFromVideoDevice(
        device.deviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const code = result.getText();
            setLastScan(code);
            onScan?.(code);
          }
        },
      );
    } catch (e: any) {
      setError(e?.message ?? "Camera access denied");
      setIsScanning(false);
    }
  }, [onScan]);

  useEffect(() => {
    return () => stopScanning();
  }, [stopScanning]);

  return { isScanning, lastScan, error, startScanning, stopScanning, videoRef };
}