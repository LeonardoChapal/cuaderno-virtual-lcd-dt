import PageTransition from "@/components/public/PageTransition";
import Rotulo from "@/components/public/Rotulo";
import SheetFrame from "@/components/public/SheetFrame";
import SiteHeader from "@/components/public/SiteHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid-paper flex min-h-dvh flex-col">
      <SheetFrame />
      <SiteHeader />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Rotulo />
    </div>
  );
}
