import Banner from "@/shared/ui/Banner";
import Icon from "@/shared/ui/Icon";
import { useError } from "@/shared/context/useError";

export function ErrorBanner() {
  const { message } = useError();
  if (!message) return null;

  return (
    <Banner variant="warning" icon={<Icon name="info" size={16} />}>
      {message}
    </Banner>
  );
}
