import type { AppNavBlockProps } from "./type";

function AppNavDesktop({ className }: AppNavBlockProps) {
  return <div></div>;
}

function AppNavMobile({ className }: AppNavBlockProps) {
  return <div></div>;
}

export function AppNavBlock() {
  return (
    <>
      <AppNavDesktop className="hidden md:flex" />
      <AppNavMobile className="flex md:hidden" />
    </>
  );
}

export default AppNavBlock;
