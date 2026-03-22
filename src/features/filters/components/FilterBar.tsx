import { useMemo, useState } from "react";
import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { Checkbox } from "@/shared/components/checkbox";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { Separator } from "@/shared/components/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/popover";
import {
  SlidersHorizontal,
  X,
  Building2,
  User,
  Calendar,
  Layers,
  Clock,
} from "lucide-react";

export type EntityFilterType = "person" | "organization" | "event";

export interface AppliedFilters {
  clusters: string[];
  entityTypes: EntityFilterType[];
  dateFrom: string | null;
  dateTo: string | null;
}

export const EMPTY_FILTERS: AppliedFilters = {
  clusters: [],
  entityTypes: [],
  dateFrom: null,
  dateTo: null,
};

interface FilterBarProps {
  onApply: (filters: AppliedFilters) => void;
  disabled?: boolean;
}

const CLUSTERS = [
  { id: "1", name: "Космос", count: 42, color: "bg-chart-1" },
  { id: "2", name: "Технологии", count: 78, color: "bg-chart-2" },
  { id: "3", name: "Инвестиции", count: 35, color: "bg-chart-3" },
  { id: "4", name: "Автопром", count: 28, color: "bg-chart-4" },
  { id: "5", name: "AI", count: 56, color: "bg-chart-5" },
];

const ENTITY_TYPES: {
  value: EntityFilterType;
  label: string;
  Icon: typeof User;
}[] = [
  { value: "person", label: "Персоны", Icon: User },
  { value: "organization", label: "Организации", Icon: Building2 },
  { value: "event", label: "События", Icon: Calendar },
];

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
}

function parseDate(value: string): Date | null {
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (
    d.getFullYear() !== Number(yyyy) ||
    d.getMonth() !== Number(mm) - 1 ||
    d.getDate() !== Number(dd)
  )
    return null;
  return d;
}

function toIso(value: string): string | null {
  const d = parseDate(value);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isoToDisplay(iso: string | null): string {
  if (!iso) return "";
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}-${mm}-${yyyy}`;
}

interface Draft {
  clusters: string[];
  entityTypes: EntityFilterType[];
  rawFrom: string;
  rawTo: string;
}

const EMPTY_DRAFT: Draft = {
  clusters: [],
  entityTypes: [],
  rawFrom: "",
  rawTo: "",
};

function countActive(f: AppliedFilters) {
  return (
    f.clusters.length +
    f.entityTypes.length +
    (f.dateFrom ? 1 : 0) +
    (f.dateTo ? 1 : 0)
  );
}

export function FilterBar({ onApply, disabled = false }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [applied, setApplied] = useState<AppliedFilters>(EMPTY_FILTERS);

  const activeCount = countActive(applied);
  const hasActive = activeCount > 0;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft({
        clusters: applied.clusters,
        entityTypes: applied.entityTypes,
        rawFrom: isoToDisplay(applied.dateFrom),
        rawTo: isoToDisplay(applied.dateTo),
      });
    }
    setOpen(next);
  };

  const toggleCluster = (id: string) =>
    setDraft((p) => ({
      ...p,
      clusters: p.clusters.includes(id)
        ? p.clusters.filter((c) => c !== id)
        : [...p.clusters, id],
    }));

  const toggleEntityType = (type: EntityFilterType) =>
    setDraft((p) => ({
      ...p,
      entityTypes: p.entityTypes.includes(type)
        ? p.entityTypes.filter((t) => t !== type)
        : [...p.entityTypes, type],
    }));

  const handleDateChange = (field: "rawFrom" | "rawTo", value: string) =>
    setDraft((p) => ({ ...p, [field]: formatDateInput(value) }));

  const dateErrors = useMemo(() => {
    const from = draft.rawFrom.length === 10 ? parseDate(draft.rawFrom) : null;
    const to = draft.rawTo.length === 10 ? parseDate(draft.rawTo) : null;
    return {
      from: draft.rawFrom.length === 10 && !from,
      to: draft.rawTo.length === 10 && !to,
      range: !!from && !!to && from > to,
    };
  }, [draft.rawFrom, draft.rawTo]);

  const hasErrors = dateErrors.from || dateErrors.to || dateErrors.range;

  const handleApply = () => {
    if (hasErrors) return;
    const next: AppliedFilters = {
      clusters: draft.clusters,
      entityTypes: draft.entityTypes,
      dateFrom: toIso(draft.rawFrom),
      dateTo: toIso(draft.rawTo),
    };
    setApplied(next);
    onApply(next);
    setOpen(false);
  };

  const handleClearDraft = () => setDraft(EMPTY_DRAFT);

  const handleReset = () => {
    setDraft(EMPTY_DRAFT);
    setApplied(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 border-border text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Фильтры
            {hasActive && (
              <Badge
                variant="default"
                className="h-4 px-1.5 text-[10px] ml-0.5"
              >
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-72 p-0 bg-card border-border"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">
              Фильтры
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 py-3 space-y-4 max-h-[70vh] overflow-y-auto">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Период
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label
                    htmlFor="f-from"
                    className="text-[11px] text-muted-foreground"
                  >
                    От
                  </Label>
                  <Input
                    id="f-from"
                    value={draft.rawFrom}
                    onChange={(e) =>
                      handleDateChange("rawFrom", e.target.value)
                    }
                    placeholder="дд-мм-гггг"
                    inputMode="numeric"
                    maxLength={10}
                    className="h-7 text-xs"
                  />
                  {dateErrors.from && (
                    <p className="text-[10px] text-destructive">
                      Неверная дата
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="f-to"
                    className="text-[11px] text-muted-foreground"
                  >
                    До
                  </Label>
                  <Input
                    id="f-to"
                    value={draft.rawTo}
                    onChange={(e) => handleDateChange("rawTo", e.target.value)}
                    placeholder="дд-мм-гггг"
                    inputMode="numeric"
                    maxLength={10}
                    className="h-7 text-xs"
                  />
                  {dateErrors.to && (
                    <p className="text-[10px] text-destructive">
                      Неверная дата
                    </p>
                  )}
                </div>
              </div>
              {dateErrors.range && (
                <p className="text-[10px] text-destructive mt-1">
                  Дата начала позже даты конца
                </p>
              )}
            </section>

            <Separator className="bg-border" />

            <section>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Тип сущности
                </span>
              </div>
              <div className="space-y-2">
                {ENTITY_TYPES.map(({ value, label, Icon }) => (
                  <div key={value} className="flex items-center gap-2">
                    <Checkbox
                      id={`et-${value}`}
                      checked={draft.entityTypes.includes(value)}
                      onCheckedChange={() => toggleEntityType(value)}
                    />
                    <Label
                      htmlFor={`et-${value}`}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="bg-border" />

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Темы
                </span>
              </div>
              <div className="space-y-2">
                {CLUSTERS.map((cl) => (
                  <div key={cl.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`cl-${cl.id}`}
                      checked={draft.clusters.includes(cl.id)}
                      onCheckedChange={() => toggleCluster(cl.id)}
                    />
                    <Label
                      htmlFor={`cl-${cl.id}`}
                      className="flex flex-1 items-center justify-between text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cl.color}`} />
                        {cl.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {cl.count}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex gap-2 px-4 py-3 border-t border-border">
            <Button
              size="sm"
              className="flex-1 h-8"
              onClick={handleApply}
              disabled={hasErrors}
            >
              Применить
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-muted-foreground hover:text-foreground"
              onClick={handleClearDraft}
            >
              Очистить
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={handleReset}
        >
          <X className="w-3.5 h-3.5" />
          Сбросить фильтры
        </Button>
      )}
    </div>
  );
}
