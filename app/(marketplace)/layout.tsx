import PrimeQuestHeader from "@/app/(marketplace)/components/PrimeQuestHeader";

export default function MarketplaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <PrimeQuestHeader whatsappHref="https://wa.me/2348038128933?text=Hello%20PrimeQuest%2C%20I%20would%20like%20to%20discuss%20an%20opportunity." />
      {children}
    </>
  );
}
