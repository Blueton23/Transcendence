import Icon from "@/shared/ui/Icon";
import Divider from "@/shared/ui/Divider";
import { type ChangeEventHandler, type FocusEventHandler } from "react";
import IconButton from "@/shared/ui/IconButton";

interface PlaceSearchFieldProps {
  value: string;
  variant?: "white" | "beige";
  dateLabel?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur: FocusEventHandler<HTMLInputElement>;
  onFocus: FocusEventHandler<HTMLInputElement>;
  onCalendarClick: () => void;
}

const variantStyle = {
  white: "bg-surface-control",
  beige: "bg-surface",
};

export function PlaceSearchField({
  value,
  variant = "beige",
  dateLabel = "",
  onChange,
  onBlur,
  onFocus,
  onCalendarClick,
}: PlaceSearchFieldProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-3 py-2 ${variantStyle[variant]}`}
    >
      <Icon name="pin" className="text-brand-primary" />
      <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        className="flex-1 text-sm text-text outline-none placeholder:text-muted"
        placeholder="Où vous arrêtez-vous ensuite ?"
      ></input>
      <Divider orientation="vertical" />
      {dateLabel ? (
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 p-1 text-sm font-semibold text-text md:p-2"
          onClick={onCalendarClick}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <Icon name="cal" />
          {dateLabel}
        </button>
      ) : (
        <IconButton
          icon={<Icon name="cal" />}
          label="cal"
          variant="ghost"
          disabled={value === ""}
          onClick={onCalendarClick}
          onMouseDown={(event) => event.stopPropagation()}
        />
      )}
    </div>
  );
}
