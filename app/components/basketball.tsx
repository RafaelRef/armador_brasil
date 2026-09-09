'use client';
import { Shirt, X } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import type { Play, Player } from '@/lib/model';
export function Jersey({
  color,
  player,
  small = false,
}: {
  color: string;
  player?: Player;
  small?: boolean;
}) {
  return (
    <span className={'jersey ' + (small ? 'small' : '')}>
      <Shirt fill={color} color={color} />
      <strong>{player?.number}</strong>
    </span>
  );
}
export function Modal({
  title,
  description,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent
        className={'app-modal ' + (wide ? 'wide' : '')}
        showCloseButton={false}
      >
        <div className="modal-head">
          <DialogTitle>{title}</DialogTitle>
          <DialogClose className="close" aria-label="Fechar">
            <X />
          </DialogClose>
        </div>
        {description && (
          <DialogDescription className="modal-description">
            {description}
          </DialogDescription>
        )}
        <div className="modal-body">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
export function Confirm({
  title,
  body,
  onConfirm,
  onClose,
}: {
  title: string;
  body: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AlertDialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <AlertDialogContent className="confirm">
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{body}</AlertDialogDescription>
        <div className="button-row">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirmar
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export function Pick({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (s: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v !== null) onChange(String(v));
      }}
    >
      <SelectTrigger aria-label={label} className="pick">
        <SelectValue>
          {options.find((o) => o.value === value)?.label ?? label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="toggle">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
export function Court() {
  return (
    <svg
      className="court-lines"
      viewBox="0 0 1000 660"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="994"
        height="654"
        fill="#dfc86b"
        stroke="white"
        strokeWidth="2"
      />
      <g fill="none" stroke="#fff9df" strokeWidth="2">
        <path d="M500 3V657" />
        <circle cx="500" cy="330" r="87" />
        <path d="M3 210H193V450H3M997 210H807V450H997" fill="#b54739" />
        <circle cx="193" cy="330" r="65" />
        <circle cx="807" cy="330" r="65" />
        <path d="M3 36H110A305 305 0 0 1 110 624H3M997 36H890A305 305 0 0 0 890 624H997M38 284V376M962 284V376" />
        <circle cx="51" cy="330" r="11" stroke="#f8b34b" />
        <circle cx="949" cy="330" r="11" stroke="#f8b34b" />
      </g>
    </svg>
  );
}
export function ShotMap({
  events = [],
  select,
  onSelect,
  zones = false,
}: {
  events?: Play[];
  select?: { x: number; y: number };
  onSelect?: (x: number, y: number) => void;
  zones?: boolean;
}) {
  const zone = (e: Play) =>
    e.free || e.y === undefined
      ? 'Sem posição'
      : e.y < 30
        ? 'Garrafão'
        : e.y < 60
          ? 'Média distância'
          : 'Perímetro';
  return (
    <div>
      <svg
        viewBox="0 0 500 430"
        className={'shot-map ' + (onSelect ? 'interactive' : '')}
        role={onSelect ? 'button' : 'img'}
        aria-label={
          onSelect
            ? 'Marcar posição do arremesso; use as setas para ajustar e Enter para confirmar'
            : 'Mapa de arremessos'
        }
        tabIndex={onSelect ? 0 : undefined}
        onKeyDown={(e) => {
          if (!onSelect) return;
          const x = select?.x ?? 50,
            y = select?.y ?? 50;
          if (
            [
              'ArrowLeft',
              'ArrowRight',
              'ArrowUp',
              'ArrowDown',
              'Enter',
            ].includes(e.key)
          ) {
            e.preventDefault();
            onSelect(
              Math.max(
                0,
                Math.min(
                  100,
                  x +
                    (e.key === 'ArrowRight'
                      ? 2
                      : e.key === 'ArrowLeft'
                        ? -2
                        : 0),
                ),
              ),
              Math.max(
                0,
                Math.min(
                  100,
                  y +
                    (e.key === 'ArrowDown' ? 2 : e.key === 'ArrowUp' ? -2 : 0),
                ),
              ),
            );
          }
        }}
        onClick={(e) => {
          if (onSelect) {
            const svg = e.currentTarget;
            const matrix = svg.getScreenCTM();
            if (!matrix) return;
            const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(
              matrix.inverse(),
            );
            if (point.x < 0 || point.x > 500 || point.y < 0 || point.y > 430)
              return;
            onSelect(point.x / 5, point.y / 4.3);
          }
        }}
      >
        <rect width="500" height="430" fill="#dfc86b" />
        {zones &&
          ['Garrafão', 'Média distância', 'Perímetro'].map((name, i) => {
            const a = events.filter((e) => zone(e) === name),
              v = a.length ? a.filter((e) => e.made).length / a.length : 0;
            return (
              <rect
                key={name}
                x="0"
                y={i === 0 ? 0 : i === 1 ? 129 : 258}
                width="500"
                height={i === 2 ? 172 : 129}
                fill={a.length ? (v > 0.5 ? '#91bf70' : '#dd8791') : '#d1ccab'}
                opacity=".8"
              />
            );
          })}
        <g stroke="white" fill="none" strokeWidth="1.8">
          <path d="M50 0V135A216 216 0 0 0 450 135V0M175 0V176H325V0M222 35H278" />
          <circle cx="250" cy="46" r="8" />
          <circle cx="250" cy="176" r="48" />
          <path d="M196 430A54 54 0 0 1 304 430" />
        </g>
        {events
          .filter((e) => e.x !== undefined && !e.free)
          .map((e) =>
            e.made ? (
              <circle
                key={e.id}
                cx={e.x! * 5}
                cy={e.y! * 4.3}
                r="4"
                stroke="#236b27"
                strokeWidth="2"
                fill="none"
              />
            ) : (
              <path
                key={e.id}
                d={`M${e.x! * 5 - 4} ${e.y! * 4.3 - 4}l8 8m0 -8l-8 8`}
                stroke="#da2553"
                strokeWidth="2"
              />
            ),
          )}
        {select && (
          <circle
            cx={select.x * 5}
            cy={select.y * 4.3}
            r="8"
            fill="#ee8c08"
            stroke="white"
            strokeWidth="3"
          />
        )}
      </svg>
      {zones && (
        <div className="zone-legend">
          {['Garrafão', 'Média distância', 'Perímetro'].map((name) => {
            const a = events.filter((e) => zone(e) === name);
            return (
              <span key={name}>
                {name}
                <b>
                  {a.filter((e) => e.made).length}/{a.length}
                </b>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
