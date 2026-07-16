import Image from "next/image";

export function BrandLogo() {
  return (
    <div className="flex items-center">
      <Image
        src="/assets/logo/pipexi-logo.png"
        alt="Pipexi Logo"
        width={140}
        height={40}
        className="h-8 w-auto object-contain"
        priority
      />
    </div>
  );
}
