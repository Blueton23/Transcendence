import Text from "../shared/ui/Text";

/*
export function Navigation() {
  return (
    <aside>
      <Text className="w-56 shrink-0 border-r border-gray-200 p-4">
        Navigation a venir
      </Text>
    </aside>
  );
}
*/

export function Navigation() {
  return (
    <aside
      className="
        fixed bottom-4 left-1/2 z-50 -translate-x-1/2
        md:static md:w-56 md:shrink-0 md:translate-x-0
      "
    >
      <Text className="p-4 md:h-full md:border-r md:border-gray-200">
        Navigation à venir
      </Text>
    </aside>
  );
}