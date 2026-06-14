'use client';

import * as React from 'react';
import 'react-day-picker/dist/style.css';
import { format, parseISO, isValid } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';

const navButtonClass = cn(
  'inline-flex items-center justify-center h-8 w-8 rounded-lg z-20',
  'border border-blue-500/50 !bg-blue-900/90 text-cyan-300',
  'hover:!bg-blue-600 hover:!text-white transition-colors',
  'focus-visible:!bg-blue-600 focus-visible:!text-white focus-visible:outline-none',
  'opacity-100 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-current',
);

const blueCalendarClassNames = {
  months: 'flex flex-col w-full',
  month: 'space-y-2 w-full',
  caption: 'relative flex items-center justify-center h-10 mb-2 w-full min-w-[260px]',
  caption_label: 'text-sm font-semibold text-white capitalize z-0',
  nav: 'absolute inset-0 flex items-center justify-between pointer-events-none',
  nav_button: cn(navButtonClass, 'pointer-events-auto'),
  nav_button_previous: '',
  nav_button_next: '',
  nav_icon: 'text-cyan-300',
  table: 'w-full border-collapse mx-auto',
  head_row: 'flex justify-center',
  head_cell: 'text-blue-300 w-9 font-medium text-[0.7rem] uppercase tracking-wide',
  row: 'flex w-full mt-1 justify-center',
  cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
  day: cn(
    'h-9 w-9 rounded-lg p-0 font-normal text-blue-100 bg-transparent',
    'hover:!bg-blue-600/70 hover:!text-white transition-colors',
    'focus-visible:!bg-blue-600/80 focus-visible:!text-white focus-visible:outline-none',
    'aria-selected:opacity-100',
  ),
  day_selected:
    'bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white shadow-md shadow-blue-900/50 border-transparent',
  day_today: 'border border-cyan-400/80 text-cyan-200 font-semibold bg-blue-900/40',
  day_outside: 'text-blue-500/35 aria-selected:text-white/70',
  day_disabled: 'text-blue-700/40 opacity-40 hover:bg-transparent',
  day_hidden: 'invisible',
};

function parseDateValue(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parseISO(value.length === 10 ? `${value}T12:00:00` : value);
  return isValid(parsed) ? parsed : undefined;
}

export interface DatePickerFieldProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  id,
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  min,
  max,
  required,
  disabled,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const selected = parseDateValue(value);
  const fromDate = parseDateValue(min);
  const toDate = parseDateValue(max);

  // Batas navigasi & pemilihan tanggal sesuai min/max
  const pickerFromDate = fromDate ?? new Date(1990, 0, 1);
  const pickerToDate = toDate ?? new Date(new Date().getFullYear() + 5, 11, 31);

  const displayLabel = selected
    ? format(selected, 'dd MMMM yyyy', { locale: localeId })
    : placeholder;

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onChange(format(date, 'yyyy-MM-dd'));
    setOpen(false);
  };

  return (
    <div className="relative">
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          className="absolute opacity-0 pointer-events-none h-0 w-0"
          value={value ?? ''}
          required={required}
          onChange={() => {}}
        />
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full h-9 justify-start gap-2.5 px-3 font-normal rounded-md',
              'bg-blue-900/50 border-blue-500/50 text-white',
              'hover:bg-blue-800/60 hover:text-white hover:border-blue-400/60',
              'focus-visible:ring-2 focus-visible:ring-cyan-400/40',
              !value && 'text-blue-400',
              className,
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-blue-400 pointer-events-none" />
            <span className="truncate text-left flex-1 min-w-0">{displayLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(
            'w-auto p-0',
            'border border-blue-500/50 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950',
            'shadow-2xl shadow-blue-950/80 backdrop-blur-md',
          )}
        >
          <div className="px-3 pt-3 pb-2 border-b border-blue-500/30">
            <p className="text-xs font-medium text-cyan-300/90 tracking-wide uppercase">
              Pilih Tanggal
            </p>
            {selected && (
              <p className="text-sm text-white mt-0.5 capitalize">
                {format(selected, 'EEEE, d MMMM yyyy', { locale: localeId })}
              </p>
            )}
          </div>
          <div className="spkt-date-picker px-3 pb-1">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              fromDate={pickerFromDate}
              toDate={pickerToDate}
              captionLayout="buttons"
              locale={localeId}
              initialFocus
              className="p-0"
              classNames={blueCalendarClassNames}
            />
          </div>
          <div className="flex gap-2 p-3 border-t border-blue-500/30 bg-blue-950/60">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1 border-blue-500/40 text-blue-200 hover:bg-blue-800/50 hover:text-white text-xs h-8"
              onClick={() => {
                const today = new Date();
                if (fromDate && today < fromDate) return;
                if (toDate && today > toDate) return;
                onChange(format(today, 'yyyy-MM-dd'));
                setOpen(false);
              }}
            >
              Hari ini
            </Button>
            {value && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="flex-1 border-blue-500/40 text-blue-200 hover:bg-blue-800/50 hover:text-white text-xs h-8"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
              >
                Hapus
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
