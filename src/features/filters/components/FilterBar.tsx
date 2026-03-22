import { useState, useEffect } from "react";
import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { Checkbox } from "@/shared/components/checkbox";
import { Label } from "@/shared/components/label";
import { Separator } from "@/shared/components/separator";
import { Slider } from "@/shared/components/slider";
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

interface DateRangeBounds {
  min: string;
  max: string;
}

interface FilterBarProps {
  onApply: (filters: AppliedFilters) => void;
  disabled?: boolean;
  dateRange?: DateRangeBounds | null;
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

function dateToMonthIdx(iso: string): number {
  const d = new Date(iso);
  return d.getFullYear() * 12 + d.getMonth();
}

function monthIdxToIso(idx: number): string {
  const year = Math.floor(idx / 12);
  const month = idx % 12;
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

const MONTH_LABELS = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

function monthIdxToLabel(idx: number): string {
  return `${MONTH_LABELS[idx % 12]} ${Math.floor(idx / 12)}`;
}

interface Draft {
  clusters: string[];
  entityTypes: EntityFilterType[];
  sliderValue: [number, number] | null;
}

function makeEmptyDraft(dateRange?: DateRangeBounds | null): Draft {
  return {
    clusters: [],
    entityTypes: [],
    sliderValue: dateRange
      ? [dateToMonthIdx(dateRange.min), dateToMonthIdx(dateRange.max)]
      : null,
  };
}

function countActive(f: AppliedFilters) {
  return (
    f.clusters.length +
    f.entityTypes.length +
    (f.dateFrom ? 1 : 0) +
    (f.dateTo ? 1 : 0)
  );
}

export function FilterBar({
  onApply,
  disabled = false,
  dateRange,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => makeEmptyDraft(dateRange));
  const [applied, setApplied] = useState<AppliedFilters>(EMPTY_FILTERS);

  useEffect(() => {
    if (!dateRange) return;
    setDraft((prev) => ({
      ...prev,
      sliderValue: [
        dateToMonthIdx(dateRange.min),
        dateToMonthIdx(dateRange.max),
      ],
    }));
  }, [dateRange]);

  const sliderMin = dateRange ? dateToMonthIdx(dateRange.min) : 0;
  const sliderMax = dateRange ? dateToMonthIdx(dateRange.max) : 0;
  const activeCount = countActive(applied);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const appliedSlider: [number, number] | null = dateRange
        ? applied.dateFrom || applied.dateTo
          ? [
              applied.dateFrom
                ? dateToMonthIdx(applied.dateFrom)
                : dateToMonthIdx(dateRange.min),
              applied.dateTo
                ? dateToMonthIdx(applied.dateTo)
                : dateToMonthIdx(dateRange.max),
            ]
          : [dateToMonthIdx(dateRange.min), dateToMonthIdx(dateRange.max)]
        : null;

      setDraft({
        clusters: applied.clusters,
        entityTypes: applied.entityTypes,
        sliderValue: appliedSlider,
      });
    }
    setOpen(next);
  };

  const handleSliderChange = (value: number[]) =>
    setDraft((p) => ({
      ...p,
      sliderValue: [value[0], value[1]] as [number, number],
    }));

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

  const handleApply = () => {
    let dateFrom: string | null = null;
    let dateTo: string | null = null;

    if (draft.sliderValue && dateRange) {
      const [fromIdx, toIdx] = draft.sliderValue;
      const isFullRange = fromIdx === sliderMin && toIdx === sliderMax;
      if (!isFullRange) {
        dateFrom = monthIdxToIso(fromIdx);
        const nextMonth = new Date(monthIdxToIso(toIdx + 1));
        nextMonth.setDate(nextMonth.getDate() - 1);
        dateTo = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-${String(nextMonth.getDate()).padStart(2, "0")}`;
      }
    }

    const next: AppliedFilters = {
      clusters: draft.clusters,
      entityTypes: draft.entityTypes,
      dateFrom,
      dateTo,
    };
    setApplied(next);
    onApply(next);
    setOpen(false);
  };

  const handleReset = () => {
    const empty = makeEmptyDraft(dateRange);
    setDraft(empty);
    setApplied(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
  };

  const sliderLabel =
    dateRange && draft.sliderValue
      ? `${monthIdxToLabel(draft.sliderValue[0])} — ${monthIdxToLabel(draft.sliderValue[1])}`
      : null;

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
            {activeCount > 0 && (
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
          className="w-76 p-0 bg-card border-border"
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
              {dateRange ? (
                <div>
                  {sliderLabel && (
                    <p className="text-xs font-medium text-foreground mb-2">
                      {sliderLabel}
                    </p>
                  )}
                  <Slider
                    min={sliderMin}
                    max={sliderMax}
                    step={1}
                    value={draft.sliderValue ?? [sliderMin, sliderMax]}
                    onValueChange={handleSliderChange}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground">
                      {monthIdxToLabel(sliderMin)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {monthIdxToLabel(sliderMax)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Доступно после запроса
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
            <Button size="sm" className="flex-1 h-8" onClick={handleApply}>
              Применить
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-muted-foreground hover:text-foreground"
              onClick={() => setDraft(makeEmptyDraft(dateRange))}
            >
              Очистить
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {activeCount > 0 && (
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
