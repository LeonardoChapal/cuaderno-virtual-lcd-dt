"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useId, useRef, useState, useTransition } from "react";

import { reorderPosts } from "@/app/admin/actions";
import DeletePostButton from "@/components/admin/DeletePostButton";

export type AdminPostItem = {
  id: string;
  title: string;
  published: boolean;
  /** Fecha y resumen de adjuntos, ya formateados en el servidor. */
  meta: string;
};

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

function Row({
  item,
  index,
  total,
  disabled,
  onMove,
}: {
  item: AdminPostItem;
  index: number;
  total: number;
  disabled: boolean;
  onMove: (from: number, to: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-wrap items-center gap-3 border bg-prussian/90 px-3 py-3 sm:px-4 ${
        isDragging
          ? "relative z-10 border-amber shadow-[0_0_0_1px_var(--color-amber)]"
          : "border-blueline/40"
      }`}
    >
      {/* Asa de arrastre: solo ella inicia el arrastre (así se puede hacer
          scroll en el celular tocando el resto de la fila). */}
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label={`Mover "${item.title}"`}
        className="flex h-11 w-9 shrink-0 cursor-grab touch-none items-center justify-center text-label transition-colors hover:text-cyan active:cursor-grabbing disabled:cursor-wait disabled:opacity-40"
      >
        <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
          <circle cx="7" cy="5" r="1.5" />
          <circle cx="13" cy="5" r="1.5" />
          <circle cx="7" cy="10" r="1.5" />
          <circle cx="13" cy="10" r="1.5" />
          <circle cx="7" cy="15" r="1.5" />
          <circle cx="13" cy="15" r="1.5" />
        </svg>
      </button>

      <span className="tag w-7 shrink-0 text-label">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="truncate font-display text-base uppercase tracking-wide text-chalk">
            {item.title}
          </span>
          {!item.published ? (
            <span className="tag border border-graphite/40 px-2 py-0.5 text-graphite">
              Borrador
            </span>
          ) : null}
        </p>
        <p className="tag mt-1 text-label">{item.meta}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => onMove(index, index - 1)}
          disabled={disabled || index === 0}
          aria-label={`Subir "${item.title}"`}
          className="tag h-10 w-9 border border-blueline/40 text-graphite transition-colors hover:border-cyan hover:text-cyan disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMove(index, index + 1)}
          disabled={disabled || index === total - 1}
          aria-label={`Bajar "${item.title}"`}
          className="tag h-10 w-9 border border-blueline/40 text-graphite transition-colors hover:border-cyan hover:text-cyan disabled:opacity-30"
        >
          ↓
        </button>
        <Link
          href={`/admin/posts/${item.id}`}
          className="tag border border-blueline/50 px-3 py-3 text-chalk transition-colors hover:border-cyan hover:text-cyan"
        >
          Editar
        </Link>
        <DeletePostButton id={item.id} title={item.title} />
      </div>
    </li>
  );
}

/**
 * Lista ordenable de un grupo (sección + subsección + plano). El orden de
 * aquí es el del sitio público. Se mueve arrastrando el asa (ratón, dedo o
 * teclado: espacio para tomar, flechas para mover, espacio para soltar) o con
 * los botones ↑/↓. Cada cambio se guarda al momento; si falla, se deshace.
 */
export default function SortablePostGroup({
  title,
  items: initialItems,
}: {
  title: string;
  items: AdminPostItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  // Id estable entre servidor y cliente para los aria-describedby de dnd-kit
  // (su contador interno provoca errores de hidratación en Next).
  const dndId = useId();
  // Último orden confirmado por el servidor, para deshacer si algo falla.
  const confirmed = useRef(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const titleOf = (id: string | number) =>
    items.find((item) => item.id === id)?.title ?? "la publicación";
  const positionOf = (id: string | number) =>
    items.findIndex((item) => item.id === id) + 1;

  function commit(next: AdminPostItem[]) {
    setItems(next);
    setSave({ kind: "saving" });
    startTransition(async () => {
      const result = await reorderPosts(next.map((item) => item.id));
      if (result.error) {
        setItems(confirmed.current);
        setSave({ kind: "error", message: result.error });
      } else {
        confirmed.current = next;
        setSave({ kind: "saved" });
      }
    });
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    commit(arrayMove(items, from, to));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    if (from < 0 || to < 0) return;
    move(from, to);
  }

  const busy = isPending || save.kind === "saving";

  return (
    <section className="mb-8">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="tag text-amber">{title}</h2>
        <p aria-live="polite" className="tag text-label">
          {save.kind === "saving"
            ? "Guardando orden…"
            : save.kind === "saved"
              ? "Orden guardado ✓"
              : items.length > 1
                ? "Arrastra ⠿ o usa ↑ ↓ para ordenar"
                : ""}
        </p>
      </header>

      {save.kind === "error" ? (
        <p
          role="alert"
          className="mb-3 border-l-2 border-amber bg-amber/10 px-4 py-2 text-sm text-amber"
        >
          {save.message}
        </p>
      ) : null}

      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              "Para mover una publicación, pulsa espacio o Enter. Usa las flechas arriba y abajo para cambiarla de lugar y pulsa espacio o Enter para soltarla, o Escape para cancelar.",
          },
          announcements: {
            onDragStart: ({ active }) =>
              `Tomaste "${titleOf(active.id)}", en la posición ${positionOf(active.id)} de ${items.length}.`,
            onDragOver: ({ active, over }) =>
              over
                ? `"${titleOf(active.id)}" ahora está sobre la posición ${positionOf(over.id)} de ${items.length}.`
                : `"${titleOf(active.id)}" ya no está sobre la lista.`,
            onDragEnd: ({ active, over }) =>
              over
                ? `Soltaste "${titleOf(active.id)}" en la posición ${positionOf(over.id)} de ${items.length}.`
                : `Soltaste "${titleOf(active.id)}" sin moverla.`,
            onDragCancel: ({ active }) =>
              `Movimiento cancelado. "${titleOf(active.id)}" vuelve a su lugar.`,
          },
        }}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="flex flex-col gap-2">
            {items.map((item, index) => (
              <Row
                key={item.id}
                item={item}
                index={index}
                total={items.length}
                disabled={busy}
                onMove={move}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </section>
  );
}
